
ALTER TABLE car_rental.dbo.booking_items DROP CONSTRAINT CK__booking_i__price__66603565;
ALTER TABLE car_rental.dbo.booking_items DROP CONSTRAINT CK__booking_i__quant__68487DD7;
ALTER TABLE car_rental.dbo.booking_items DROP CONSTRAINT CK__booking_i__subto__6A30C649;

-- Xoá DEFAULT constraints
ALTER TABLE car_rental.dbo.booking_items DROP CONSTRAINT DF__booking_i__quant__6754599E;
ALTER TABLE car_rental.dbo.booking_items DROP CONSTRAINT DF__booking_it__unit__693CA210;

-- Drop columns
ALTER TABLE car_rental.dbo.booking_items DROP COLUMN price_per_unit;
ALTER TABLE car_rental.dbo.booking_items DROP COLUMN quantity;
ALTER TABLE car_rental.dbo.booking_items DROP COLUMN unit;
ALTER TABLE car_rental.dbo.vehicles
    ADD price_per_hour decimal(12,2) NULL;