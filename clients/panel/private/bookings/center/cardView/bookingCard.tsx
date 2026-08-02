import { compose } from "redux";
import { useEffect, useState } from "react";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { Card } from "@coreModule/components/ui/card.tsx";
import { cn } from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import { IconCalendar, IconClock, IconUser } from "@tabler/icons-react";
import type { Booking } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/booking/booking.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import BookingSheetView from "@eCommerceMarketplaceModule/clients/panel/private/bookings/center/sheetView/bookingSheetView.tsx";

type BookingCardProps = WithLanguageType & {
    booking: Booking;
    onDelete?: (deleted?: Booking, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function formatDate(value: Date | string): string {
    return new Date(value).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

function formatTime(value: Date | string): string {
    return new Date(value).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function BookingCard({
    booking: bookingProp,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: BookingCardProps) {
    const [action, setAction] = useState("");
    const [booking, setBooking] = useState<Booking>(bookingProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const { read, restore } = useAccess("bookings");

    useEffect(() => { setBooking(bookingProp); }, [bookingProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else {
            if (onDeleteProp) onDeleteProp(booking, data);
            else setBooking({ ...booking, ...(data as any) });
        }
    };
    const onRestore = () => { if (onRestoreProp) onRestoreProp(); };

    if (hideAfterDeletion || !restore) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const providerName = booking.provider
        ? [booking.provider.name, booking.provider.surname].filter(Boolean).join(" ")
        : undefined;

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:cursor-pointer",
                        "border border-border/60 shadow-sm gap-0",
                    )}
                    onClick={() => setAction("view")}
                >
                    <div className="h-1 w-full bg-primary/60" />

                    {(read as any).deletedBy && (
                        <DeletedInfo deletedAt={(booking as any).deletedAt} deletedBy={(booking as any).deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground min-w-0 truncate">
                                <IconCalendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                                {formatDate(booking.startAt)}
                            </span>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="bookings"
                                        deletedData={booking as any}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                    />
                                </div>
                            )}
                        </div>

                        <div className="h-px bg-border" />

                        <div className="flex items-center justify-between gap-2">
                            {providerName ? (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                    <IconUser className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{providerName}</span>
                                </span>
                            ) : <span />}

                            <div className="flex items-center gap-2 shrink-0 ml-auto">
                                <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                    <IconClock className="w-3 h-3" />
                                    {formatTime(booking.startAt)} – {formatTime(booking.endAt)}
                                </span>
                                {booking.timezone && (
                                    <span className="text-[10px] text-muted-foreground font-medium shrink-0">
                                        {booking.timezone}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {action === "view" && (
                <BookingSheetView
                    open
                    onOpenChange={() => setAction("")}
                    booking={booking}
                    fetchId={booking._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                    onSheetRowPatched={(patch) => setBooking({ ...booking, ...patch })}
                />
            )}
            {action === "delete" && (
                <DeleteAction accessModel="bookings" deleteId={booking._id} openAlert onSuccess={onDelete} onCancel={() => setAction("")} url="/api/eCommerceMarketplace/booking" />
            )}
            {action === "restore" && (
                <RestoreAction accessModel="bookings" deleteId={booking._id} openAlert onSuccess={onRestore} onCancel={() => setAction("")} url="/api/eCommerceMarketplace/booking/restore" />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/bookings/center/cardView/bookingCard.tsx"),
    withDebug(true, true),
)(BookingCard);
