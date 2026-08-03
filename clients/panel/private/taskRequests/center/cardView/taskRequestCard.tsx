import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withAxios, {WithAxiosType} from "@coreModule/helpers/hocs/withAxios.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import {useAccess} from "@coreModule/helpers/hocs/withAccess.tsx";
import {useEffect, useImperativeHandle, useState} from "react";
import {Card} from "@coreModule/components/ui/card.tsx";
import ValueNotSet from "@coreModule/components/custom/valueNotSet.tsx";
import {cn} from "@coreModule/components/lib/utils.ts";
import type {TaskRequest} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/taskRequest/taskRequest.dto.ts";
import type {DeletedData, SingleForm} from "armonia/src/modules/core/types/shared.types.ts";
import DeletedInfo from "@coreModule/components/custom/deletedInfo";
import {IconCalendar, IconFolder, IconMapPin, IconPhoto, IconUsers} from "@tabler/icons-react";
import TaskRequestSheetView from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests/center/sheetView/taskRequestSheetView.tsx";
import DeleteAction from "@coreModule/components/custom/actions/deleteAction.tsx";
import RestoreAction from "@coreModule/components/custom/actions/restoreAction.tsx";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import CloseTaskRequestDropdown from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests/center/actions/closeTaskRequestDropdown.tsx";
import ReopenTaskRequestDropdown from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests/center/actions/reopenTaskRequestDropdown.tsx";
import NotifyAllTaskRequestDropdown from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests/center/actions/notifyAllTaskRequestDropdown.tsx";
import TaskRequestStatusConfirmAction from "@eCommerceMarketplaceModule/components/custom/taskRequests/taskRequestStatusConfirmAction.tsx";
import TaskRequestNotifyAllConfirmAction from "@eCommerceMarketplaceModule/components/custom/taskRequests/taskRequestNotifyAllConfirmAction.tsx";
import {taskRequestEditPath} from "@eCommerceMarketplaceModule/clients/panel/private/taskRequests";
import Loader from "@coreModule/components/custom/loader.tsx";
import {ErrorView} from "@coreModule/components/custom/errorView.tsx";

function formatBudget(entity: TaskRequest): string | undefined {
    const {budgetMin, budgetMax, currency} = entity;
    const sym = currency?.symbol?.trim() || currency?.abbreviation?.trim();
    if (budgetMin == null && budgetMax == null) return undefined;
    const fmt = (n: number) =>
        n.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2});
    if (budgetMin != null && budgetMax != null) {
        const s = `${fmt(budgetMin)} – ${fmt(budgetMax)}`;
        return sym ? `${sym} ${s}` : s;
    }
    const n = budgetMin ?? budgetMax!;
    return sym ? `${sym} ${fmt(n)}` : fmt(n);
}

type TaskRequestCardProps = WithLanguageType &
    WithAxiosType<TaskRequest, SingleForm> & {
        entity: TaskRequest;
        fetchId?: string;
        onDelete?: (entity?: TaskRequest, response?: DeletedData) => void;
        onRestore?: () => void;
        onEntityUpdated?: (entity: TaskRequest) => void;
        hideActions?: boolean;
        sheetOnly?: boolean;
    };

function TaskRequestCard({
    entity: entityProp,
    fetchId,
    onFilterChange,
    loading,
    error,
    innerRef,
    resolveLanguageKey,
    onDelete: onDeleteProp,
    onRestore: onRestoreProp,
    onEntityUpdated,
    hideActions = false,
    sheetOnly = false,
}: TaskRequestCardProps) {
    const [action, setAction] = useState<string>("");
    const [entity, setEntity] = useState<TaskRequest>(entityProp);
    const [hideAfterDeletion, setHideAfterDeletion] = useState(false);
    const [forceReload, setForceReload] = useState(1);

    const onDelete = (data: DeletedData) => {
        if (!data.deletedBy && !data.deletedAt) {
            setHideAfterDeletion(true);
        } else if (onDeleteProp) {
            onDeleteProp(entity, data);
        } else {
            setEntity({...entity, ...data});
        }
    };

    const onRestore = () => {
        if (onRestoreProp) {
            onRestoreProp();
        } else {
            setEntity({...entity, deletedAt: undefined, deletedBy: undefined});
        }
    };

    const {read, restore} = useAccess("taskRequests");

    useEffect(() => {
        if (!fetchId) setEntity(entityProp);
    }, [entityProp, fetchId]);

    useEffect(() => {
        if (fetchId) onFilterChange({_id: fetchId});
    }, [fetchId, forceReload]);

    useImperativeHandle(innerRef, () => ({
        success: (data: TaskRequest) => setEntity(data),
    }));

    if (hideAfterDeletion) return <></>;
    if (!restore && entity.deletedAt != null) return <></>;
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
    if (!entity?._id) return <></>;

    const budgetStr = formatBudget(entity);
    const canReadRequesterName = !!(read?.requester?.keys?.name || read?.requester?.keys?.surname);
    const requesterName = [
        read?.requester?.keys?.name ? entity.requester?.name : "",
        read?.requester?.keys?.surname ? entity.requester?.surname : "",
    ]
        .filter(Boolean)
        .join(" ")
        .trim();
    const requesterInitials = [
        read?.requester?.keys?.name ? entity.requester?.name?.[0] : "",
        read?.requester?.keys?.surname ? entity.requester?.surname?.[0] : "",
    ]
        .filter(Boolean)
        .join("")
        .toUpperCase();

    const now = Date.now();
    const expiresMs = entity.expiresAt ? new Date(entity.expiresAt).getTime() : null;
    const msLeft = expiresMs ? expiresMs - now : null;
    const isExpiringSoon = msLeft != null && msLeft > 0 && msLeft < 3 * 24 * 60 * 60 * 1000;
    const isExpired = msLeft != null && msLeft <= 0;
    const expiresLabel = expiresMs
        ? new Date(expiresMs).toLocaleDateString(undefined, {day: "2-digit", month: "short"})
        : null;
    const canReadBudget = !!(read?.budgetMin || read?.budgetMax);

    return (
        <>
            {!sheetOnly && (
                <Card
                    className={cn(
                        "group p-0 h-full relative overflow-hidden transition-all duration-300",
                        "hover:shadow-xl hover:cursor-pointer",
                        "border border-border/60 shadow-sm gap-2 pb-2"
                    )}
                    onClick={fetchId ? undefined : () => setAction("view")}
                >
                    {/* ── Image ─────────────────────────────────────────── */}
                    <div className="relative h-50 overflow-hidden bg-muted">
                        <HiddenElement randomLength={read?.mainImage ? 0 : 12}>
                            {!!read?.mainImage ? (
                                entity.mainImage ? (
                                    <img
                                        src={`/api/auxiliary/media/${entity.mainImage._id}`}
                                        alt={read?.title ? entity.title : ""}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-muted via-muted/70 to-muted/40">
                                        <IconPhoto className="w-14 h-14 text-muted-foreground/15" />
                                    </div>
                                )
                            ) : null}
                        </HiddenElement>

                        {/* Gradient scrim for bottom overlays */}
                        <div className="absolute inset-0 transform-gpu bg-linear-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

                        {/* Action menu */}
                        {!hideActions && (
                            <div
                                className="absolute top-2 right-2"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ActionMenu
                                    accessModel="taskRequests"
                                    deletedData={entity}
                                    onAction={(a: string) => setAction(a)}
                                    editPath={taskRequestEditPath(entity)}
                                    allowMenuForCustomChildren
                                    alwaysShowDropDownMenuTrigger
                                >
                                    <NotifyAllTaskRequestDropdown entity={entity} onAction={(a: string) => setAction(a)} />
                                    <CloseTaskRequestDropdown entity={entity} onAction={(a: string) => setAction(a)} />
                                    <ReopenTaskRequestDropdown entity={entity} onAction={(a: string) => setAction(a)} />
                                </ActionMenu>
                            </div>
                        )}

                        {/* Bottom image row: category left, bid count right */}
                        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
                            <HiddenElement randomLength={read?.category?.keys?.name ? 0 : 8}>
                                {!!read?.category?.keys?.name && entity.category?.name ? (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20 shadow-sm truncate max-w-[60%]">
                                        <IconFolder className="w-3 h-3 shrink-0" />
                                        <span className="truncate">{entity.category.name}</span>
                                    </span>
                                ) : null}
                            </HiddenElement>
                            {(entity.bidCount != null && entity.bidCount > 0) && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-foreground shadow-sm shrink-0 ml-auto">
                                    <IconUsers className="w-3 h-3" />
                                    {entity.bidCount}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── Deleted banner ────────────────────────────────── */}
                    {(read.deletedBy || read.deletedAt) && (
                        <DeletedInfo deletedAt={entity.deletedAt} deletedBy={entity.deletedBy} />
                    )}

                    {/* ── Content ───────────────────────────────────────── */}
                    <div className="px-3 py-1 flex flex-col gap-2">

                        {/* Requester row + status */}
                        <div className="flex items-center justify-between gap-2">
                            <HiddenElement randomLength={canReadRequesterName ? 0 : 10}>
                                {canReadRequesterName && entity.requester ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 ring-1 ring-primary/20">
                                            <span className="text-[9px] font-bold text-primary leading-none">
                                                {requesterInitials}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground truncate">
                                            {requesterName}
                                        </span>
                                    </div>
                                ) : null}
                            </HiddenElement>
                            <HiddenElement randomLength={read?.status ? 0 : 6}>
                                {!!read?.status && entity.status ? (
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide shrink-0",
                                        entity.status === "open"   ? "text-emerald-600" :
                                        entity.status === "awarded"? "text-amber-600"   :
                                        "text-muted-foreground",
                                    )}>
                                        <span className={cn(
                                            "w-1.5 h-1.5 rounded-full shrink-0",
                                            entity.status === "open"    ? "bg-emerald-500 animate-pulse" :
                                            entity.status === "awarded" ? "bg-amber-500"                 :
                                            "bg-muted-foreground/40",
                                        )} />
                                        {resolveLanguageKey("statuses." + entity.status)}
                                    </span>
                                ) : null}
                            </HiddenElement>
                        </div>

                        {/* Title */}
                        <HiddenElement randomLength={10}>
                            {!!read?.title ? (
                                <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground min-h-6">
                                    {entity.title || <ValueNotSet />}
                                </h3>
                            ) : null}
                        </HiddenElement>

                        {/* Description excerpt */}
                        {(!!entity.description || !read?.description) && (
                            <HiddenElement randomLength={read?.description ? 0 : 16}>
                                {!!read?.description && entity.description ? (
                                    <p className="text-xs text-muted-foreground line-clamp-1 leading-normal -mt-0.5">
                                        {entity.description}
                                    </p>
                                ) : null}
                            </HiddenElement>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Footer: location + expiry | budget */}
                        <div className="flex items-end justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0 flex-wrap">
                                <HiddenElement randomLength={read?.address ? 0 : 8}>
                                    {!!read?.address && entity.address?.city?.name ? (
                                        <span className="flex items-center gap-1 truncate">
                                            <IconMapPin className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{entity.address.city.name}</span>
                                        </span>
                                    ) : null}
                                </HiddenElement>
                                <HiddenElement randomLength={read?.expiresAt ? 0 : 6}>
                                    {!!read?.expiresAt && expiresLabel ? (
                                        <span className={cn(
                                            "flex items-center gap-1 shrink-0 px-2 py-0.5 rounded-full bg-muted",
                                            isExpiringSoon && "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
                                            isExpired && "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
                                        )}>
                                            <IconCalendar className="w-3 h-3" />
                                            {expiresLabel}
                                        </span>
                                    ) : null}
                                </HiddenElement>
                            </div>

                            <HiddenElement randomLength={canReadBudget ? 0 : 8}>
                                {canReadBudget && budgetStr ? (
                                    <div className="shrink-0 text-right">
                                        <div className="text-[9px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                                            {resolveLanguageKey("budget")}
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="font-bold text-base text-foreground leading-none">
                                                {budgetStr}
                                            </span>
                                        </div>
                                    </div>
                                ) : null}
                            </HiddenElement>
                        </div>
                    </div>
                </Card>
            )}

            {!!action && (
                <>
                    {action === "view" && (
                        <TaskRequestSheetView
                            open={action === "view"}
                            onOpenChange={() => setAction("")}
                            entity={entity}
                            fetchId={fetchId}
                            onDelete={onDelete}
                            onRestore={onRestore}
                            onEntityUpdated={(e: TaskRequest) => {
                                setEntity(e);
                                onEntityUpdated?.(e);
                            }}
                        />
                    )}
                    {action === "delete" && (
                        <DeleteAction
                            accessModel="taskRequests"
                            deleteId={entity._id}
                            openAlert={action === "delete"}
                            name={read?.title && entity.title}
                            confirmName={read?.title && entity.title}
                            onSuccess={onDelete}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/taskRequest"
                        />
                    )}
                    {action === "restore" && (
                        <RestoreAction
                            accessModel="taskRequests"
                            deleteId={entity._id}
                            openAlert={action === "restore"}
                            name={read?.title && entity.title}
                            confirmName={read?.title && entity.title}
                            onSuccess={onRestore}
                            onCancel={() => setAction("")}
                            url="/api/eCommerceMarketplace/taskRequest/restore"
                        />
                    )}
                    {action === "notifyAll" && (
                        <TaskRequestNotifyAllConfirmAction
                            taskRequestId={entity._id}
                            displayName={entity.title}
                            openAlert
                            url="/api/eCommerceMarketplace/taskRequest/notifyAll"
                            onSuccess={() => setAction("")}
                            onCancel={() => setAction("")}
                        />
                    )}
                    {(action === "close" || action === "reopen") && (
                        <TaskRequestStatusConfirmAction
                            actionKey={action}
                            taskRequestId={entity._id}
                            displayName={entity.title}
                            openAlert
                            url={`/api/eCommerceMarketplace/taskRequest/${action}`}
                            onSuccess={(newStatus: TaskRequest["status"]) => {
                                const updated = {...entity, status: newStatus};
                                setEntity(updated);
                                onEntityUpdated?.(updated);
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
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/taskRequests/center/cardView/taskRequestCard.tsx"),
    withAxios<TaskRequest, SingleForm>(
        {url: "/api/eCommerceMarketplace/taskRequest/single", method: "POST", data: {}},
        true,
    ),
    withDebug(true, true),
)(TaskRequestCard);
