import {compose} from "redux";
import {useEffect, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import TableAvatar from "@coreModule/components/custom/avatar/tableAvatar.tsx";
import {IconLayoutList, IconPackage, IconStar} from "@tabler/icons-react";
import {Star} from "lucide-react";
import type {Review} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/review.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReviewSheetView from "../sheetView/reviewSheetView.tsx";

const RATING_CONFIG: Record<number, {band: string; text: string}> = {
    1: {band: "bg-linear-to-r from-slate-400 to-slate-300", text: "text-slate-600"},
    2: {band: "bg-linear-to-r from-orange-400 to-orange-300", text: "text-orange-600"},
    3: {band: "bg-linear-to-r from-amber-400 to-amber-300", text: "text-amber-600"},
    4: {band: "bg-linear-to-r from-yellow-400 to-yellow-300", text: "text-yellow-600"},
    5: {band: "bg-linear-to-r from-emerald-500 to-emerald-400", text: "text-emerald-600"},
};

type ReviewCardProps = WithLanguageType & {
    review: Review;
    onDelete?: (deleted?: Review, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function formatReviewerName(review: Review): string {
    const {name, surname} = review.reviewer ?? {};
    return [name, surname].filter(Boolean).join(" ").trim() || "—";
}

function reviewCardTitle(review: Review): string {
    const comment = review.comment?.trim();
    if (comment) {
        return comment.length > 80 ? `${comment.slice(0, 80)}…` : comment;
    }
    return (
        review.listing?.title ||
        review.order?.listing?.title ||
        review.order?.taskRequest?.title ||
        review.order?.name ||
        `${review.rating}/5`
    );
}

function ReviewCard({
    review: reviewProp,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
}: ReviewCardProps) {
    const [action, setAction] = useState("");
    const [review, setReview] = useState<Review>(reviewProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const {read, restore} = useAccess("reviews");

    useEffect(() => {
        setReview(reviewProp);
    }, [reviewProp]);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(review, data);
        } else {
            setReview({...review, ...(data as Partial<Review>)});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) onRestoreProp();
    };

    if (hideAfterDeletion) return <></>;
    if (!restore && review.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const ratingCfg = RATING_CONFIG[review.rating] ?? RATING_CONFIG[3];
    const title = reviewCardTitle(review);
    const reviewerName = formatReviewerName(review);
    const reviewerInitials = [review.reviewer?.name?.[0], review.reviewer?.surname?.[0]]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const listingTitle =
        review.listing?.title ||
        review.order?.listing?.title ||
        review.order?.taskRequest?.title ||
        review.order?.name;

    const stars = Array.from({length: 5}, (_, i) => i < review.rating);

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
                    <div className={cn("h-1 w-full", ratingCfg.band)} />

                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={review.deletedAt} deletedBy={review.deletedBy} />
                    )}

                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-[2.5rem] flex-1 min-w-0">
                                {title}
                            </h3>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="reviews"
                                        deletedData={review}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                        hideEdit
                                    />
                                </div>
                            )}
                        </div>

                        <span
                            className={cn(
                                "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide -mt-1",
                                ratingCfg.text,
                            )}
                        >
                            <IconStar className="w-3 h-3 shrink-0" />
                            <span className="flex gap-0.5">
                                {stars.map((filled, i) => (
                                    <Star
                                        key={i}
                                        size={10}
                                        className={filled ? "fill-current" : "text-muted-foreground/40"}
                                    />
                                ))}
                            </span>
                            {review.rating}/5
                        </span>

                        {review.reviewer && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                                {review.reviewer.photo ? (
                                    <TableAvatar mediaId={review.reviewer.photo} />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 ring-1 ring-border">
                                        <span className="text-[8px] font-bold text-foreground leading-none">
                                            {reviewerInitials || "?"}
                                        </span>
                                    </div>
                                )}
                                <span className="truncate">{reviewerName}</span>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        <div className="flex items-end justify-between gap-2">
                            {listingTitle && (
                                <span className="flex items-center gap-1 text-xs text-muted-foreground min-w-0 truncate">
                                    <IconLayoutList className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{listingTitle}</span>
                                </span>
                            )}
                            {review.order?._id && (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 ml-auto">
                                    <IconPackage className="w-3 h-3" />
                                    <span className="font-mono truncate max-w-[5rem]">{review.order._id.slice(-6)}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </Card>
            )}
            {action === "view" && (
                <ReviewSheetView
                    open
                    onOpenChange={() => setAction("")}
                    review={review}
                    fetchId={review._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            {action === "delete" && (
                <DeleteAction
                    accessModel="reviews"
                    deleteId={review._id}
                    openAlert
                    onSuccess={onDelete}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/review"
                />
            )}
            {action === "restore" && (
                <RestoreAction
                    accessModel="reviews"
                    deleteId={review._id}
                    openAlert
                    onSuccess={onRestore}
                    onCancel={() => setAction("")}
                    url="/api/eCommerceMarketplace/review/restore"
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerce/clients/panel/private/reviews/center/cardView/reviewCard.tsx"),
    withDebug(true, true),
)(ReviewCard);
