from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class PropertyBase(BaseModel):
    listing_type: str = Field(default="Rent", description="Rent or Sale")
    bhk: str = Field(default="2 BHK", description="1 RK, 1 BHK, 2 BHK, 3 BHK, etc.")
    building_name: str = Field(default="", description="Building / Society / Complex name")
    location_area: str = Field(default="", description="Locality, City, Area (e.g. Thane West)")
    furnishing: str = Field(default="Semi-Furnished", description="Unfurnished, Semi-Furnished, Fully Furnished")
    rent_price: float = Field(default=0.0, description="Monthly rent or sale price in INR")
    deposit: str = Field(default="", description="Deposit amount or term (e.g. 6 Months Rent)")
    features: str = Field(default="", description="Key amenities and features")
    contact_numbers: str = Field(default="", description="Comma-separated phone numbers")
    agency: str = Field(default="", description="Agency or broker name")
    status: str = Field(default="Available", description="Available, Under Negotiation, Rented, Sold")
    raw_message: Optional[str] = Field(default="", description="Original WhatsApp message text")
    source: str = Field(default="Manual", description="WhatsApp Import, Folder Watcher, or Manual")

class PropertyCreate(PropertyBase):
    pass

class PropertyUpdate(BaseModel):
    listing_type: Optional[str] = None
    bhk: Optional[str] = None
    building_name: Optional[str] = None
    location_area: Optional[str] = None
    furnishing: Optional[str] = None
    rent_price: Optional[float] = None
    deposit: Optional[str] = None
    features: Optional[str] = None
    contact_numbers: Optional[str] = None
    agency: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Property(PropertyBase):
    id: str
    date_added: str

class LeadBase(BaseModel):
    name: str = Field(description="Client / Prospect Name")
    phone: str = Field(default="", description="Contact mobile number")
    client_type: str = Field(default="Tenant", description="Tenant (Rent) or Buyer (Sale)")
    preferred_bhk: str = Field(default="2 BHK", description="Preferred BHKs, e.g. 2 BHK, 3 BHK")
    preferred_locations: str = Field(default="", description="Target localities, e.g. Thane West, Majiwada")
    min_budget: float = Field(default=0.0, description="Minimum budget in INR")
    max_budget: float = Field(default=0.0, description="Maximum budget in INR")
    furnishing: str = Field(default="Any", description="Any, Semi-Furnished, Fully Furnished, Unfurnished")
    move_in_date: str = Field(default="Immediate", description="Move-in timeline, e.g. Immediate, 15 days")
    status: str = Field(default="New", description="New, Contacted, Visit Scheduled, Closed, Dropped")
    notes: str = Field(default="", description="Broker notes & follow-up log")

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    client_type: Optional[str] = None
    preferred_bhk: Optional[str] = None
    preferred_locations: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    furnishing: Optional[str] = None
    move_in_date: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class Lead(LeadBase):
    id: str
    date_added: str

class MatchItem(BaseModel):
    property: Property
    lead: Lead
    score: int
    match_reasons: List[str]
    whatsapp_pitch: str

class IngestionResult(BaseModel):
    total_messages_scanned: int
    listings_detected: int
    properties_added: int
    duplicates_skipped: int
    items: List[Property]
