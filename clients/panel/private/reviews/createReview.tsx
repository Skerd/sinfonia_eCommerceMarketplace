import {IconPlus} from "@tabler/icons-react";
import {createGenericCreatePage} from "@coreModule/components/entityPage/createGenericCreatePage.tsx";
import {createReviewFormSchema} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/createReview.form.validator.ts";
import type {CreateReviewFormType} from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/review/review.schema-def.ts";

export default createGenericCreatePage<CreateReviewFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/reviews/createReview.tsx",
    collectionName: "reviews",
    accessModel: "reviews",
    apiUrl: "/api/eCommerceMarketplace/review",
    schema: createReviewFormSchema,
    defaultValues: {orderId: "", rating: 5, comment: ""},
    submitIcon: <IconPlus />,
    successPath: "/eCommerceMarketplace/reviews",
});
