import {compose} from "redux";
import withLanguage, {WithLanguageType} from "@coreModule/helpers/hocs/withLanguage.tsx";
import withDebug from "@coreModule/helpers/hocs/withDebug.tsx";
import EntityListPage from "@coreModule/components/entityPage/EntityListPage.tsx";
import {IconPlus} from "@tabler/icons-react";
import type {Review} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/review.dto.ts";
import type {DeletedData} from "armonia/src/modules/core/types/shared.types.ts";
import ReviewCard from "./center/cardView/reviewCard.tsx";
import ReviewSheetView from "./center/sheetView/reviewSheetView.tsx";

/** Reviews are not edited via a form page; create-only with admin delete/restore. */
function noopReviewEditPath(_review: Pick<Review, "_id">): string {
    return "";
}

function reviewRowLabel(review: Review): string {
    const name = [review.reviewer?.name, review.reviewer?.surname].filter(Boolean).join(" ").trim();
    if (name) return `${review.rating}/5 — ${name}`;
    return `${review.rating}/5`;
}

function AllReviews({resolveLanguageKey}: WithLanguageType) {
    return (
        <EntityListPage<Review>
            apiUrl="/api/eCommerceMarketplace/review"
            collectionName="reviews"
            accessModel="reviews"
            tableConfigKey="reviews"
            createPath="/eCommerceMarketplace/reviews/create"
            createIcon={<IconPlus />}
            createLanguageKey="createReview"
            buildEditPath={noopReviewEditPath}
            resolveLanguageKey={resolveLanguageKey}
            sheetLanguagePath="src/modules/eCommerceMarketplace/clients/panel/private/reviews/center/sheetView/reviewSheetView.tsx"
            cardViewClassName="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            rowActionMenu={{hideEdit: true}}
            buildDeleteConfirmLabel={(entity) => reviewRowLabel(entity)}
            renderSheet={({entity, open, onOpenChange, onDelete, onRestore}) => (
                <ReviewSheetView
                    open={open}
                    onOpenChange={(opened: boolean) => {
                        if (!opened) {
                            onOpenChange();
                        }
                    }}
                    review={entity}
                    fetchId={entity._id}
                    onDelete={onDelete}
                    onRestore={onRestore}
                />
            )}
            renderCard={(review, onDelete, onRestore) => (
                <ReviewCard
                    review={review}
                    onDelete={(row: Review | undefined, response?: DeletedData) => onDelete(row ?? review, response)}
                    onRestore={() => onRestore(review)}
                />
            )}
        />
    );
}

export default compose(
    withLanguage("src/modules/eCommerceMarketplace/clients/panel/private/reviews/index.tsx"),
    withDebug(true, true, "reviews"),
)(AllReviews);
