export interface EventMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  title: string;
  state: string;
  content: string;
  organizer: AccountShort;
  startDate: string;
  endDate: string;
  location: AddressMZWO;
  product: ProductMZWO;
  foodUnit: string;
  foodQuantity: number;
  availableFoodQuantity: number;
  maxParticipants: number;
  maxReservationQuantity: number;
  availableSlots: number;
  isParticipant: boolean;
}

export interface ModeratorEventMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  title: string;
  state: string;
  content: string;
  startDate: string;
  endDate: string;
  location: AddressMZWO;
  product: ProductMZWO;
  foodUnit: string;
  foodQuantity: number;
  availableFoodQuantity: number;
  maxParticipants: number;
  maxReservationQuantity: number;
  availableSlots: number;
  isParticipant: boolean;
  participants: ParticipantMZWO[];
  etag: string;
}

export type CombinedEvent = EventMZWO & ModeratorEventMZWO;

export interface AddressMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  city: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  latitude: string;
  longitude: string;
}

export interface ProductMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  productName: string;
  category: string;
  image: string;
}

export interface CreateEventMZWO {
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  location: CreateAddressMZWO;
  product: CreateProductMZWO;
  foodUnit: string;
  foodQuantity: number;
  maxParticipants: number;
  maxReservationQuantity: number;
}

export interface CreateAddressMZWO {
  city: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  latitude: string;
  longitude: string;
}

export interface CreateProductMZWO {
  productName: string;
  category: string;
  image: string;
}

export interface AccountMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  strikes: number;
}

export interface ParticipantMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  username: string;
  isEnabled: boolean;
  strikes: number;
}

export interface ReservationMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  account: AccountMZWO;
  event: EventMZWO;
  quantity: number;
  reservationState: string;
}

export interface ResponseError {
  error: string;
  key: string;
  reason: string;
  request: string;
  status: number;
}
export interface AnnouncementMZWO {
  id: number;
  creator: string;
  lastModifiedBy: string;
  createdAt: string;
  lastModifiedAt: string;
  version: number;
  title: string;
  state: string;
  content: string;
}
export interface CreateAnnouncementMZWO {
  title: string;
  content: string;
}

export interface FilterFormData {
  searchString: string;
  city: string;
  street: string;
  eventFilter: string;
  eventState: string;
  productCategory: string;
  startDate: string;
  endDate: string;
}

export interface UnitTypes {
  Item: number;
  Liter: number;
  Piece: number;
  Kilogram: number;
  Pack: number;
}

export interface CategoryUnitTypes {
  Proteins: UnitTypes;
  Prepared: UnitTypes;
  Grain: UnitTypes;
  Vegetables: UnitTypes;
  Dairy: UnitTypes;
  Beverages: UnitTypes;
  Sweets: UnitTypes;
  Fruits: UnitTypes;
}

export interface AccountStatistics {
  eventsCreated: number;
  announcementsPublished: number;
  reservationsMade: number;
  reservationsByParticipants: number;
  eventsAttended: number;
  averageEventParticipants: number;
  totalEventsParticipants: number;
  mostCommonCategory: string;
  yourClaimedFood: CategoryUnitTypes;
  averageEventFoodGiven: CategoryUnitTypes;
  totalFoodClaimed: CategoryUnitTypes;
  totalEventFood: CategoryUnitTypes;
}

export interface AccountShort {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  strikes: number;
}
