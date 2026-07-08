import { Save } from "lucide-react";
import { createGenericEditPage } from "@coreModule/components/entityPage/createGenericEditPage.tsx";
import { editProviderAvailabilityFormSchema } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/editProviderAvailability.form.validator.ts";
import type { ProviderAvailability } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.dto.ts";
import type { EditProviderAvailabilityFormType } from "armonia/src/modules/eCommerceMarketplace/api/eCommerceMarketplace/private/providerAvailability/providerAvailability.schema-def.ts";

export default createGenericEditPage<ProviderAvailability, EditProviderAvailabilityFormType>({
    languagePath: "src/modules/eCommerceMarketplace/clients/panel/private/providerAvailability/editProviderAvailability.tsx",
    collectionName: "provideravailabilities",
    accessModel: "providerAvailabilities",
    apiUrl: "/api/eCommerceMarketplace/providerAvailability",
    schema: editProviderAvailabilityFormSchema,
    buildInitialValues: (data, writeFields) => ({
        _id: data._id,
        dayOfWeek: writeFields.dayOfWeek ? data.dayOfWeek : undefined,
        startTime: writeFields.startTime ? data.startTime : undefined,
        endTime: writeFields.endTime ? data.endTime : undefined,
        timezone: writeFields.timezone ? data.timezone : undefined,
    }),
    submitIcon: <Save />,
});
