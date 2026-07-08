import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import { IconPlus } from "@tabler/icons-react";
import type { Booking } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/booking/booking.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import BookingCard from "./center/cardView/bookingCard.tsx";

function AllBookings({ resolveLanguageKey }: WithLanguageType) {
    return (
        <EntityListPage<Booking>
            apiUrl="/api/eCommerceMarketplace/booking"
            collectionName="bookings"
            accessModel="bookings"
            tableConfigKey="bookings"
            createPath="/eCommerce/bookings/create"
            createIcon={<IconPlus />}
            createLanguageKey="createBooking"
            buildEditPath={() => ""}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{ hideEdit: true }}
            renderCard={(booking, onDelete, onRestore) => (
                <BookingCard
                    booking={booking}
                    onDelete={(row, response?: DeletedData) => onDelete(row ?? booking, response)}
                    onRestore={() => onRestore(booking)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/bookings/index.tsx"),
    withDebug(true, true),
)(AllBookings);
