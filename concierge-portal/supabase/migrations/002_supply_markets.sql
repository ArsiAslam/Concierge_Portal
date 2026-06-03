-- ============================================================
-- Migration 002: Agent Supply & Lender Supply market tables
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Agent supply table
create table public.agent_supply (
  id         bigint generated always as identity primary key,
  market     text not null,
  agents     integer not null default 0,
  created_at timestamptz not null default now()
);

-- Lender supply table
create table public.lender_supply (
  id         bigint generated always as identity primary key,
  market     text not null,
  lenders    integer not null default 0,
  created_at timestamptz not null default now()
);

-- Seed agent supply data
insert into public.agent_supply (market, agents) values
  ('Columbus, OH',    20),
  ('Cleveland, OH',   15),
  ('Denver, CO',      13),
  ('Memphis, TN',      9),
  ('Minneapolis, MN',  9),
  ('Dayton, OH',       8),
  ('Chicago, IL',      7),
  ('Austin, TX',       6);

-- Seed lender supply data
insert into public.lender_supply (market, lenders) values
  ('Orlando, FL',64),('Tampa, FL',64),('Bradenton, FL',64),('Fort Myers, FL',64),
  ('Jacksonville, FL',64),('Saint Augustine, FL',64),('Miami, FL',64),('Santa Rosa Beach, FL',64),
  ('Sarasota, FL',64),('Destin, FL',64),('Miramar, FL',64),('Panama City Beach, FL',64),
  ('Reunion, FL',64),('Seagrove Beach, FL',64),('Port Saint Lucie, FL',64),('Palm Beach Gardens, FL',64),
  ('Gainesville, FL',64),('Pensacola, FL',64),('Tallahassee, FL',64),
  ('Austin, TX',55),('San Antonio, TX',55),('Houston, TX',55),('College Station, TX',55),
  ('Dallas, TX',55),('Fort Worth, TX',55),('Manor, TX',55),('Grapevine, TX',55),
  ('The Woodlands, TX',55),('Van Alstyne, TX',55),('Killeen, TX',55),
  ('Chattanooga, TN',49),('Knoxville, TN',49),('Memphis, TN',49),('Nashville, TN',49),
  ('Gatlinburg, TN',49),('Green Hill, TN',49),('Clarksville, TN',49),('Johnson City, TN',49),
  ('Atlanta, GA',47),('Roswell, GA',47),('Blue Ridge, GA',47),('Augusta, GA',47),('Savannah, GA',47),
  ('Asheville, NC',46),('Charlotte, NC',46),('New Bern, NC',46),('Durham, NC',46),
  ('Wilmington, NC',46),('Fayetteville, NC',46),('Greenville, NC',46),('Greensboro, NC',46),
  ('Colorado Springs, CO',39),('Denver, CO',39),('Buena Vista, CO',39),('Longmont, CO',39),
  ('Philadelphia, PA',37),('York, PA',37),('Pittsburgh, PA',37),('Lancaster, PA',37),
  ('Pottstown, PA',37),('Allentown, PA',37),('Carbondale, PA',37),('Exton, PA',37),
  ('Mount Pocono, PA',37),('Scranton, PA',37),('West Chester, PA',37),('Hummelstown, PA',37),
  ('Reading, PA',37),('Worcester, PA',37),('Limerick, PA',37),
  ('Cincinnati, OH',36),('Akron, OH',36),('Indianapolis, IN',36),('Dayton, OH',36),
  ('Columbus, OH',36),('Cleveland, OH',36),('Greenville, SC',36),('North Charleston, SC',36),
  ('Logan, OH',36),('Columbia, SC',36),('Fort Wayne, IN',36),('Lorain, OH',36),
  ('Myrtle Beach, SC',36),('Toledo, OH',36),('South Bend, IN',36),('Charleston, SC',36),
  ('Greer, SC',36),('Troy, OH',36),('Spartanburg, SC',36),('Auburn, IN',36),
  ('Fishers, IN',36),('Fortville, IN',36),
  ('Palm Springs, CA',33),('Sacramento, CA',33),('San Diego, CA',33),('Irvine, CA',33),
  ('Temecula, CA',33),('Fresno, CA',33),('Baldwin Park, CA',33),('Burbank, CA',33),
  ('Carmel-by-the-Sea, CA',33),('Chino Hills, CA',33),('East Los Angeles, CA',33),
  ('Culver City, CA',33),('Hayward, CA',33),('Menifee, CA',33),('Oceanside, CA',33),
  ('Torrance, CA',33),('Carmichael, CA',33),('Concord, CA',33),('Carlsbad, CA',33),
  ('La Mesa, CA',33),('Long Beach, CA',33),('Livingston, CA',33),('Monterey, CA',33),
  ('Palo Alto, CA',33),('Riverside, CA',33),('Redlands, CA',33),
  ('Seattle, WA',31),('Tacoma, WA',31),('Bellevue, WA',31),('Federal Way, WA',31),('Auburn, WA',31),
  ('Norfolk, VA',30),('Richmond, VA',30),('Roanoke, VA',30),('Virginia Beach, VA',30),
  ('Bedford, VA',30),('Newport News, VA',30),
  ('Phoenix, AZ',29),('Scottsdale, AZ',29),('Yuma, AZ',29),('Chandler, AZ',29),
  ('Dothan, AL',29),('Gulf Shores, AL',29),('Huntsville, AL',29),('Tuscaloosa, AL',29),
  ('Gilbert, AZ',29),('Tucson, AZ',29),
  ('Fall River, MA',27),('Boston, MA',27),('Cambridge, MA',27),('Leominster, MA',27),
  ('Springfield, MA',27),('Lowell, MA',27),('Taunton, MA',27),('Wakefield, MA',27),('Worcester, MA',27),
  ('New Haven, CT',26),('Farmington, CT',26),('Hartford, CT',26),('New Hartford, CT',26),
  ('Norwich, CT',26),('Oxford, CT',26),('Ledyard, CT',26),('Somers, CT',26),
  ('Chicago, IL',24),('Elgin, IL',24),('Glenview, IL',24),('La Grange, IL',24),
  ('Skokie, IL',24),('Wheaton, IL',24),('Ottawa, IL',24),('Tinley Park, IL',24),
  ('Milwaukee, WI',23),('Madison, WI',23),('Oklahoma City, OK',23),('Tulsa, OK',23),
  ('Green Bay, WI',23),('Neptune City, NJ',23),('New Brunswick, NJ',23),('Newark, NJ',23),
  ('Kenosha, WI',23),('La Crosse, WI',23),('West Milwaukee, WI',23),
  ('Louisville, KY',22),('St. Louis, MO',22),('Kansas City, MO',22),('Rochester, NY',22),
  ('Syracuse, NY',22),('Buffalo, NY',22),('Baltimore, MD',22),('Annapolis, MD',22),
  ('Bardstown, KY',22),('Pittsford, NY',22),('Rome, NY',22),('Springfield, MO',22),
  ('Wildwood, MO',22),('Binghamton, NY',22),('Endicott, NY',22),('Highland, MI',22),
  ('Queens, NY',22),('White Plains, NY',22),
  ('Grand Rapids, MI',21),('Detroit, MI',21),('Flint, MI',21),('Royal Oak, MI',21),('Lansing, MI',21),
  ('Manhattan, KS',20),('Little Rock, AR',20),('Kansas City, KS',20),
  ('Fayetteville, AR',20),('Rogers, AR',20),
  ('Bend, OR',19),('Corvallis, OR',19),('Eugene, OR',19),('Lincoln Beach, OR',19),('Salem, OR',19),
  ('Washington, DC',18),
  ('Jackson, MS',17),('Ocean Springs, MS',17),
  ('Albuquerque, NM',16),('Concord, NH',16),('Manchester, NH',16),
  ('Providence, RI',15),('Laramie, WY',15),('Cranston, RI',15),
  ('Kalispell, MT',14),('Whitefish, MT',14),
  ('Cedar Rapids, IA',13),('Boise, ID',13),('Des Moines, IA',13),('Omaha, NE',13),
  ('Iowa City, IA',13),('New Orleans, LA',13),('Swisher, IA',13),
  ('Minneapolis, MN',12),('Duluth, MN',12),('Saint Paul, MN',12),
  ('Salt Lake City, UT',11),('Las Vegas, NV',11),('Lehi, UT',11),('Sandy, UT',11),
  ('Bountiful, UT',11),('Incline Village, NV',11),('Reno, NV',11),
  ('Stowe, VT',8),
  ('Anchorage, AK',5),
  ('Clearwater, FL',0),('Boynton Beach, FL',0),('Ocala, FL',0),('El Paso, TX',0);

-- RLS
alter table public.agent_supply  enable row level security;
alter table public.lender_supply enable row level security;

create policy "Authenticated users can view agent supply"
  on public.agent_supply for select using (auth.role() = 'authenticated');

create policy "Authenticated users can view lender supply"
  on public.lender_supply for select using (auth.role() = 'authenticated');
