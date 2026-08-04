import { compose } from "redux";
import withLanguage, { WithLanguageType } from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import { useAccess } from "@coreModule/helpers/hocs/withAccess.tsx";
import HiddenElement from "@coreModule/components/custom/hiddenElement.tsx";
import { cn } from "@coreModule/components/lib/utils.ts";
import ActionMenu from "@coreModule/components/custom/actions/menu/actionMenu.tsx";
import { IconStar, IconCode } from "@tabler/icons-react";
import type { ProviderProfile } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerProfile/providerProfile.dto.ts";
import type { DeletedData } from "armonia/src/modules/core/types/shared.types.ts";
import ProviderProfileSheetView from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/sheetView/providerProfileSheetView.tsx";
import CreateAccountLinkDropdown from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/actions/createAccountLinkDropdown.tsx";
import RefreshAccountStatusDropdown from "@eCommerceMarketplaceModule/clients/panel/private/providerProfile/center/actions/refreshAccountStatusDropdown.tsx";
import ConnectAccountAction, {
    type ConnectActionKey,
} from "@eCommerceMarketplaceModule/components/custom/providerProfile/connectAccountAction.tsx";
import {InfoRowGroup} from "@coreModule/components/custom/infoRowGroup.tsx";
import {useEntityCard} from "@coreModule/helpers/hooks/useEntityCard.ts";
import {EntityCardShell} from "@coreModule/components/custom/cards/EntityCardShell.tsx";
import {EntityTextCardHeader} from "@coreModule/components/custom/cards/EntityTextCardHeader.tsx";
import {CARD_BODY_CLASS} from "@coreModule/components/custom/cards/entityCard.constants.ts";
import {Separator} from "@coreModule/components/ui/separator.tsx";

type ProviderProfileCardProps = WithLanguageType & {
    profile: ProviderProfile;
    onDelete?: (deleted?: ProviderProfile, response?: DeletedData) => void;
    onRestore?: () => void;
    hideActions?: boolean;
    sheetOnly?: boolean;
};

function profileDisplayName(profile: ProviderProfile) {
    return [profile.user?.name, profile.user?.surname].filter(Boolean).join(" ") || undefined;
}

function ProviderProfileCard({
    profile: profileProp,
    resolveLanguageKey,
    hideActions = false,
    sheetOnly = false,
}: ProviderProfileCardProps) {
    const {action, setAction, entity: profile, setEntity} = useEntityCard({
        entityProp: profileProp,
    });
    const { read } = useAccess("providerProfiles");

    if (!read || !Object.keys(read).length) return <HiddenElement />;

    const userName = profileDisplayName(profile) || "—";
    const initials = [profile.user?.name?.[0], profile.user?.surname?.[0]].filter(Boolean).join("").toUpperCase();

    const editPath = (() => {
        if (!profile._id) return "";
        const params = new URLSearchParams();
        params.set("profileId", profile._id);
        const name = profile.user?.name;
        if (name) params.set("profileName", name);
        return `/eCommerceMarketplace/providerprofile/edit?${params.toString()}`;
    })();

    const connectStatusLabel = profile.stripePayoutsEnabled
        ? resolveLanguageKey("connect.payoutsEnabled")
        : profile.stripeAccountId
          ? resolveLanguageKey("connect.setupIncomplete")
          : resolveLanguageKey("connect.notConnected");

    return (
        <>
            {!sheetOnly && (
                <EntityCardShell onClick={() => setAction("view")}>
                    <div className="p-3 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-primary/10 ring-1 ring-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-3xs font-bold text-primary leading-none">{initials || "?"}</span>
                                </div>
                                <h3 className="font-semibold text-sm leading-snug truncate text-foreground">
                                    {userName}
                                </h3>
                            </div>
                            {!hideActions && (
                                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                    <ActionMenu
                                        accessModel="providerProfiles"
                                        deletedData={profile as any}
                                        onAction={(a: string) => setAction(a)}
                                        editPath={editPath}
                                        allowMenuForCustomChildren
                                    >
                                        <CreateAccountLinkDropdown profile={profile} onAction={(a: string) => setAction(a)} />
                                        <RefreshAccountStatusDropdown profile={profile} onAction={(a: string) => setAction(a)} />
                                    </ActionMenu>
                                </div>
                            )}
                        </div>

                        {profile.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">{profile.bio}</p>
                        )}

                        <div className="h-px bg-border" />

                        <div className="flex items-center justify-between gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                                <div className="flex items-center gap-1 min-w-0 truncate">
                                    <IconCode className="w-3 h-3 shrink-0 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground truncate">
                                        {profile.skills.slice(0, 3).join(", ")}
                                        {profile.skills.length > 3 && ` +${profile.skills.length - 3}`}
                                    </span>
                                </div>
                            ) : <span />}

                            {profile.averageRating != null && (
                                <span className="flex items-center gap-1 shrink-0 text-xs font-semibold text-warning">
                                    <IconStar className="w-3 h-3" />
                                    {profile.averageRating.toFixed(1)}
                                    {profile.reviewCount != null && (
                                        <span className="font-normal text-muted-foreground">({profile.reviewCount})</span>
                                    )}
                                </span>
                            )}
                        </div>

                        <span
                            className={cn(
                                "inline-flex w-fit items-center text-3xs font-semibold uppercase tracking-wide",
                                profile.stripePayoutsEnabled
                                    ? "text-success"
                                    : profile.stripeAccountId
                                      ? "text-warning"
                                      : "text-muted-foreground",
                            )}
                        >
                            {connectStatusLabel}
                        </span>
                    </div>
                </EntityCardShell>
            )}

            {action === "view" && (
                <ProviderProfileSheetView
                    open
                    onOpenChange={() => setAction("")}
                    profile={profile}
                    fetchId={profile._id}
                    onSheetRowPatched={(patch: Partial<ProviderProfile>) => setEntity({ ...profile, ...patch })}
                />
            )}
            {(action === "createAccountLink" || action === "refreshAccountStatus") && (
                <ConnectAccountAction
                    actionKey={action as ConnectActionKey}
                    displayName={userName === "—" ? undefined : userName}
                    openAlert
                    url={`/api/eCommerceMarketplace/providerProfile/${action}`}
                    onSuccess={(result: {
                        stripeAccountId?: string;
                        chargesEnabled?: boolean;
                        payoutsEnabled?: boolean;
                        detailsSubmitted?: boolean;
                    }) => {
                        setEntity({
                            ...profile,
                            ...(result.stripeAccountId ? {stripeAccountId: result.stripeAccountId} : {}),
                            ...(result.chargesEnabled !== undefined ? {stripeChargesEnabled: result.chargesEnabled} : {}),
                            ...(result.payoutsEnabled !== undefined ? {stripePayoutsEnabled: result.payoutsEnabled} : {}),
                            ...(result.detailsSubmitted !== undefined ? {stripeDetailsSubmitted: result.detailsSubmitted} : {}),
                            stripeAccountSyncedAt: new Date().toISOString(),
                        });
                        setAction("");
                    }}
                    onCancel={() => setAction("")}
                />
            )}
        </>
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/providerProfile/center/cardView/providerProfileCard.tsx"),
    withDebug(true, true),
)(ProviderProfileCard);
