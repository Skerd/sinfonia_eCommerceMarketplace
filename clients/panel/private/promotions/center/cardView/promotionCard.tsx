import {compose} from "redux";
import {useEffect, useImperativeHandle, useState} from "react";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";
import {Card} from "@coreModule/components/ui/card.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import type {Promotion} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/promotion/promotion.dto.ts";
import type {DeletedData, SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import PromotionSheetView from "@eCommerceMarketplaceModule/clients/panel/private/promotions/center/sheetView/promotionSheetView.tsx";
import PausePromotionDropdown from "@eCommerceMarketplaceModule/clients/panel/private/promotions/center/actions/pausePromotionDropdown.tsx";
import ResumePromotionDropdown from "@eCommerceMarketplaceModule/clients/panel/private/promotions/center/actions/resumePromotionDropdown.tsx";
import StopPromotionDropdown from "@eCommerceMarketplaceModule/clients/panel/private/promotions/center/actions/stopPromotionDropdown.tsx";
import ChangePromotionLifecycleAction from "@eCommerceMarketplaceModule/components/custom/promotions/changePromotionLifecycleAction.tsx";
import {formatDate} from "@coreModule/helpers/general";
import {useSelector} from "react-redux";
import {RootState} from "@coreModule/helpers/redux/store/generalStore.ts";
import {IconCalendar, IconListDetails, IconSparkles, IconStar} from "@tabler/icons-react";

export type PromotionDisplayStatus = "stopped" | "paused" | "upcoming" | "active" | "ended";

function deriveDatePhase(startAt: Date | string, endAt: Date | string): "upcoming" | "active" | "ended" {
    const now = Date.now();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
}

/** Badge + progress: paused/stopped trump date-based phase. */
function derivePromotionDisplayStatus(promotion: Promotion): PromotionDisplayStatus {
    const lc = promotion.lifecycleStatus ?? "active";
    if (lc === "stopped") return "stopped";
    if (lc === "paused") return "paused";
    return deriveDatePhase(promotion.startAt, promotion.endAt);
}

function deriveProgress(startAt: Date | string, endAt: Date | string): number {
    const now = Date.now();
    const start = new Date(startAt).getTime();
    const end = new Date(endAt).getTime();
    if (end <= start) return 0;
    return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

type PromotionCardProps = WithLanguageType &
    WithAxiosType<Promotion, SingleForm> & {
        promotion: Promotion;
        fetchId?: string;
        onDelete?: (deleted?: Promotion, response?: DeletedData) => void;
        onRestore?: (restored?: Promotion) => void;
        hideActions?: boolean;
        sheetOnly?: boolean;
    };

function PromotionCard({
    promotion: promotionProp,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    hideActions = false,
    sheetOnly = false,
    resolveLanguageKey,
}: PromotionCardProps) {
    const [action, setAction] = useState("");
    const [promotion, setPromotion] = useState<Promotion>(promotionProp);
    const [forceReload, setForceReload] = useState(1);
    const {read, restore} = useAccess("promotions");
    const {timezone} = useSelector((state: RootState) => state.authentication.user);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            onDeleteProp?.(promotion, data);
            return;
        }
        const next = {...promotion, ...data};
        setPromotion(next);
        onDeleteProp?.(next, data);
    };

    const onRestore = (data?: DeletedData) => {
        const next: Promotion = {
            ...promotion,
            deletedAt: undefined,
            deletedBy: undefined,
            ...data,
        };
        setPromotion(next);
        onRestoreProp?.(next);
    };

    useEffect(() => {
        if (!fetchId) setPromotion(promotionProp);
    }, [promotionProp, fetchId]);

    useEffect(() => {
        if (fetchId) onFilterChange({_id: fetchId});
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: Promotion) => setPromotion(data),
    }));

    if (!restore && promotion.deletedAt != null) return <></>;
    if (!read || !Object.keys(read).length) return <HiddenElement />;
    if (fetchId && loading) return <Loader />;
    if (fetchId && error) {
        return (
            <ErrorView
                title={resolveLanguageKey("failedTitle")}
                description={resolveLanguageKey("failedDescription")}
                onClick={() => setForceReload((n) => n + 1)}
            />
        );
    }
    if (!promotion?._id) return <></>;

    const isFeatured = promotion.type === "featured";
    const lifecycle = promotion.lifecycleStatus ?? "active";
    const displayStatus = derivePromotionDisplayStatus(promotion);
    const progress = deriveProgress(promotion.startAt, promotion.endAt);
    const listingTitle = promotion.listing?.title;
    const endStillFuture =
        !!promotion.endAt && !Number.isNaN(new Date(promotion.endAt).getTime())
            ? new Date(promotion.endAt).getTime() > Date.now()
            : false;

    const dateOpts = {
        day: "2-digit" as const,
        month: "2-digit" as const,
        year: "numeric" as const,
    };

    const barClass =
        displayStatus === "stopped"
            ? "bg-muted-foreground/35"
            : displayStatus === "paused"
              ? "bg-amber-500/60"
              : displayStatus === "active"
                ? isFeatured
                    ? "bg-amber-400"
                    : "bg-blue-500"
                : displayStatus === "ended"
                  ? "bg-muted-foreground/40"
                  : "bg-muted-foreground/20";

    const labelClass =
        displayStatus === "active"
            ? isFeatured
                ? "text-amber-600"
                : "text-blue-600"
            : displayStatus === "paused"
              ? "text-amber-700 dark:text-amber-400"
              : displayStatus === "stopped"
                ? "text-destructive/90"
                : displayStatus === "upcoming"
                  ? "text-muted-foreground"
                  : "text-muted-foreground/60";

    const dotClass =
        displayStatus === "active"
            ? isFeatured
                ? "bg-amber-500 animate-pulse"
                : "bg-blue-500 animate-pulse"
            : displayStatus === "paused"
              ? "bg-amber-500"
              : displayStatus === "stopped"
                ? "bg-destructive"
                : displayStatus === "upcoming"
                  ? "bg-muted-foreground/50"
                  : "bg-muted-foreground/30";

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group relative h-full overflow-hidden p-0 transition-all duration-300",
                        "hover:shadow-xl hover:-translate-y-0.5 hover:cursor-pointer",
                        "border border-border/60 shadow-sm",
                    )}
                    onClick={() => setAction("view")}
                >
                    {/* ── Deleted banner ────────────────────────────────── */}
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={promotion.deletedAt} deletedBy={promotion.deletedBy} />
                    )}

                    {/* ── Content ───────────────────────────────────────── */}
                    <div className="p-3 flex flex-col gap-2.5">
                        {/* Header row: type badge + action menu */}
                        <div className="flex items-start justify-between gap-2">
                            <div
                                className={cn(
                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                                    isFeatured
                                        ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
                                )}
                            >
                                {isFeatured ? <IconSparkles className="w-3 h-3" /> : <IconStar className="w-3 h-3" />}
                                {resolveLanguageKey(promotion.type)}
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="promotions"
                                        deletedData={promotion}
                                        onAction={(a: string) => setAction(a)}
                                        editPath=""
                                        hideEdit
                                        allowMenuForCustomChildren
                                    >
                                        {!promotion.deletedAt && lifecycle === "active" && (
                                            <PausePromotionDropdown onAction={(a: string) => setAction(a)} />
                                        )}
                                        {!promotion.deletedAt && lifecycle === "paused" && endStillFuture && (
                                            <ResumePromotionDropdown onAction={(a: string) => setAction(a)} />
                                        )}
                                        {!promotion.deletedAt && lifecycle !== "stopped" && (
                                            <StopPromotionDropdown onAction={(a: string) => setAction(a)} />
                                        )}
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        {/* Name */}
                        {read?.name && (
                            <h3 className="font-semibold text-sm leading-snug line-clamp-1 text-foreground">
                                {promotion.name ?? "—"}
                            </h3>
                        )}

                        {/* Listing reference */}
                        {read?.listing && promotion.listing && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
                                <IconListDetails className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">
                                    {listingTitle || promotion.listing.name || "—"}
                                </span>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Date range */}
                        <div className="flex flex-col gap-1.5">
                            {(read?.startAt || read?.endAt) && (
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    {read?.startAt && (
                                        <span className="flex items-center gap-1 shrink-0">
                                            <IconCalendar className="w-3 h-3" />
                                            {promotion.startAt
                                                ? formatDate(promotion.startAt, {timeZone: timezone, format: dateOpts})
                                                : "—"}
                                        </span>
                                    )}
                                    {read?.startAt && read?.endAt && (
                                        <div className="flex-1 flex items-center gap-1 min-w-0">
                                            <div className="h-px flex-1 bg-border" />
                                            <span className="text-[9px] text-muted-foreground/60 shrink-0">
                                                {resolveLanguageKey("to")}
                                            </span>
                                            <div className="h-px flex-1 bg-border" />
                                        </div>
                                    )}
                                    {read?.endAt && (
                                        <span className="flex items-center gap-1 shrink-0">
                                            <IconCalendar className="w-3 h-3" />
                                            {promotion.endAt
                                                ? formatDate(promotion.endAt, {timeZone: timezone, format: dateOpts})
                                                : "—"}
                                        </span>
                                    )}
                                </div>
                            )}

                            {(read?.startAt && read?.endAt) && (
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-500", barClass)}
                                            style={{width: `${progress * 100}%`}}
                                        />
                                    </div>
                                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold shrink-0", labelClass)}>
                                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotClass)} />
                                        {resolveLanguageKey(displayStatus)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <PromotionSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            promotion={promotion}
                            fetchId={fetchId}
                            onDelete={onDelete}
                            onRestore={onRestore}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="promotions"
                            deleteId={promotion._id}
                            openAlert={action === "delete"}
                            name={listingTitle}
                            confirmName={listingTitle}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/promotion"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="promotions"
                            deleteId={promotion._id}
                            openAlert={action === "restore"}
                            name={listingTitle}
                            confirmName={listingTitle}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/promotion/restore"
                        />
                    )}
                    {(action === "pause" || action === "resume" || action === "stop") && (
                        <ChangePromotionLifecycleAction
                            promotionId={promotion._id}
                            listingTitle={listingTitle}
                            verb={action}
                            openAlert
                            url={`/api/eCommerceMarketplace/promotion/${action}`}
                            onSuccess={(patch: Partial<Promotion>) => {
                                setPromotion({...promotion, ...patch});
                                setAction("");
                            }}
                            onCancel={() => setAction("")}
                        />
                    )}
                </>
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/promotions/center/cardView/promotionCard.tsx"),
    withAxios<Promotion, SingleForm>(
        {
            url: "/api/eCommerceMarketplace/promotion/single",
            method: "POST",
            data: {},
        },
        true,
    ),
    withDebug(true, true),
)(PromotionCard);
