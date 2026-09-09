export interface Category {
  id: number;
  name: string;
  description?: string | null;
}

export interface Location {
  id: number;
  name: string;
  description?: string | null;
  parent_location_id?: number | null;
  parent?: Location | null;
}
