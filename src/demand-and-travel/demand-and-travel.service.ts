import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { DemandService } from 'src/demand/demand.service';
import { TravelService } from 'src/travel/travel.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FindDemandsAndTravelsQueryDto } from './dto/FindDemandsAndTravelsQuery.dto';

// Combined interface for demands and travels
export interface DemandOrTravel {
  id: number;
  type: 'demand' | 'travel';
  title: string;
  flightNumber: string;
  departureAirportId: number;
  arrivalAirportId: number;
  userId: number;
  status: string;
  deliveryDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Demand specific fields
  weight?: number;
  pricePerKg?: number;
  // Travel specific fields
  weightAvailable?: number;
  // Common fields from base entity
  isDeactivated?: boolean;
  deletedAt?: Date;
  createdBy?: number;
  updatedBy?: number;
}

@Injectable()
export class DemandAndTravelService {
    private demandTravelListCacheKeys: Set<string> = new Set();

    constructor(
        private demandService: DemandService, 
        private travelService: TravelService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

    async getDemandsAndTravels(query: FindDemandsAndTravelsQueryDto): Promise<PaginatedResponse<DemandOrTravel>> {
        const cacheKey = this.generateDemandTravelListCacheKey(query);
        this.demandTravelListCacheKeys.add(cacheKey);
      
        // Check cache first
        const cachedData = await this.cacheManager.get<PaginatedResponse<DemandOrTravel>>(cacheKey);
        if (cachedData) {
            console.log(`Cache Hit---------> Returning demands and travels list from Cache ${cacheKey}`);
            return cachedData;
        }
      
        console.log(`Cache Miss---------> Returning demands and travels list from database`);

        const {
            page = 1,
            limit = 10,
            title,
            flightNumber,
            departureAirportId, // Changed from originAirportId
            arrivalAirportId,   // Changed from destinationAirportId
            userId,
            status,
            deliveryDate,
            weightAvailable,
            orderBy = 'createdAt:desc'
        } = query;

        // Fetch all demands and travels without filters first
        const allDemandsQuery = {
            page: 1,
            limit: 1000,
            orderBy: 'createdAt:desc'
        };

        const allTravelsQuery = {
            page: 1,
            limit: 1000,
            orderBy: 'createdAt:desc'
        };

        // Fetch all demands and travels in parallel
        const [demandsResponse, travelsResponse] = await Promise.all([
            this.demandService.getDemands(allDemandsQuery),
            this.travelService.getAllTravels(allTravelsQuery)
        ]);

        console.log('🔍 Debug - Total demands found:', demandsResponse.items.length);
        console.log('🔍 Debug - Total travels found:', travelsResponse.items.length);

        // Transform demands to combined format
        const demands = demandsResponse.items.map(demand => ({
            id: demand.id,
            type: 'demand' as const,
            title: demand.title,
            flightNumber: demand.flightNumber,
            departureAirportId: demand.originAirportId,
            arrivalAirportId: demand.destinationAirportId,
            userId: demand.userId,
            status: demand.status,
            deliveryDate: demand.deliveryDate,
            createdAt: demand.createdAt,
            updatedAt: demand.updatedAt,
            weight: demand.weight,
            pricePerKg: demand.pricePerKg,
            isDeactivated: demand.isDeactivated,
            deletedAt: demand.deletedAt,
            createdBy: demand.createdBy,
            updatedBy: demand.updatedBy
        }));

        // Transform travels to combined format
        const travels = travelsResponse.items.map(travel => ({
            id: travel.id,
            type: 'travel' as const,
            title: travel.title,
            flightNumber: travel.flightNumber,
            departureAirportId: travel.departureAirportId,
            arrivalAirportId: travel.arrivalAirportId,
            userId: travel.userId,
            status: travel.status,
            deliveryDate: travel.arrivalDatetime,
            createdAt: travel.createdAt,
            updatedAt: travel.updatedAt,
            weightAvailable: travel.weightAvailable,
            isDeactivated: travel.isDeactivated,
            deletedAt: travel.deletedAt,
            createdBy: travel.createdBy,
            updatedBy: travel.updatedBy
        }));

        // Combine all items
        let combinedItems = [...demands, ...travels];

        // Apply filters manually
        if (title) {
            combinedItems = combinedItems.filter(item => 
                item.title.toLowerCase().includes(title.toLowerCase())
            );
        }

        if (flightNumber) {
            combinedItems = combinedItems.filter(item => 
                item.flightNumber.toLowerCase().includes(flightNumber.toLowerCase())
            );
        }

        if (departureAirportId) {
            combinedItems = combinedItems.filter(item => 
                item.departureAirportId === departureAirportId
            );
        }

        if (arrivalAirportId) {
            combinedItems = combinedItems.filter(item => 
                item.arrivalAirportId === arrivalAirportId
            );
        }

        if (userId) {
            combinedItems = combinedItems.filter(item => 
                item.userId === userId
            );
        }

        if (status) {
            combinedItems = combinedItems.filter(item => 
                item.status === status
            );
        }

        if (deliveryDate) {
            const searchDate = new Date(deliveryDate).toDateString();
            combinedItems = combinedItems.filter(item => 
                new Date(item.deliveryDate).toDateString() === searchDate
            );
        }

        if (weightAvailable) {
            combinedItems = combinedItems.filter(item => {
                if (item.type === 'travel') {
                    // For travels, check weightAvailable
                    return item.weightAvailable >= weightAvailable;
                } else if (item.type === 'demand') {
                    // For demands, check weight
                    return item.weight >= weightAvailable;
                }
                return false;
            });
        }

        console.log('🔍 Debug - Combined items after filtering:', combinedItems.length);

        // Apply sorting
        if (orderBy) {
            const [sortField, sortDirection] = orderBy.split(':');
            const validSortFields = ['createdAt', 'deliveryDate', 'title', 'flightNumber'];
            
            if (validSortFields.includes(sortField)) {
                combinedItems.sort((a, b) => {
                    let aValue = a[sortField];
                    let bValue = b[sortField];
                    
                    // Handle string comparison
                    if (typeof aValue === 'string') {
                        aValue = aValue.toLowerCase();
                        bValue = bValue.toLowerCase();
                    }
                    
                    if (sortDirection === 'asc') {
                        return aValue > bValue ? 1 : -1;
                    } else {
                        return aValue < bValue ? 1 : -1;
                    }
                });
            }
        }

        // Apply pagination
        const totalItems = combinedItems.length;
        const totalPages = Math.ceil(totalItems / limit);
        const skip = (page - 1) * limit;
        const paginatedItems = combinedItems.slice(skip, skip + limit);

        const response: PaginatedResponse<DemandOrTravel> = {
            items: paginatedItems,
            meta: {
                currentPage: page,
                itemsPerPage: limit,
                totalItems,
                totalPages,
                hasPreviousPage: page > 1,
                hasNextPage: page < totalPages
            }
        };

        // Cache the result
        await this.cacheManager.set(cacheKey, response, 30000); // 30 seconds cache

        return response;
    }

    private generateDemandTravelListCacheKey(query: FindDemandsAndTravelsQueryDto): string {
        const {
            page = 1,
            limit = 10,
            title,
            flightNumber,
            departureAirportId, // Changed from originAirportId
            arrivalAirportId,   // Changed from destinationAirportId
            userId,
            status,
            deliveryDate,
            weightAvailable,
            orderBy = 'createdAt:desc'
        } = query;

        return `demands_travels_list_page${page}_limit${limit}_title${title || 'all'}_flight${flightNumber || 'all'}_origin${departureAirportId || 'all'}_dest${arrivalAirportId || 'all'}_user${userId || 'all'}_status${status || 'all'}_date${deliveryDate || 'all'}_weight${weightAvailable || 'all'}_order${orderBy}`;
    }

    // Method to clear cache when data is updated
    async clearDemandTravelListCache(): Promise<void> {
        for (const cacheKey of this.demandTravelListCacheKeys) {
            await this.cacheManager.del(cacheKey);
        }
        this.demandTravelListCacheKeys.clear();
    }
}
