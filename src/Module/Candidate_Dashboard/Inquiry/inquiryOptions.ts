// data/inquiryOptions.ts
export interface InquiryOption {
    value: string;
    label: string;
    group: string;
}

export const INQUIRY_OPTIONS: InquiryOption[] = [
    // Mobility - Career Pathway Program
    { value: "retail_lulu", label: "Retail Pathway to Lulu Hypermarket", group: "Mobility - Career Pathway Program" },
    { value: "retail_landmark", label: "Retail Pathway to Landmark Group", group: "Mobility - Career Pathway Program" },
    { value: "hospitality_malta", label: "Hospitality Pathway to Malta", group: "Mobility - Career Pathway Program" },
    { value: "nursing_germany", label: "Nursing Pathway to Germany", group: "Mobility - Career Pathway Program" },
    { value: "ausbildung_germany", label: "Ausbildung in Germany", group: "Mobility - Career Pathway Program" },
    // ...rest of career pathway items

    // Mobility - Country Pathway Program > Malta
    { value: "malta_hospitality", label: "Hospitality Pathway to Malta", group: "Country Pathway – Malta" },

    // Mobility - Country Pathway Program > Germany
    { value: "country_de_nursing", label: "Nursing Pathway to Germany", group: "Country Pathway – Germany" },
    { value: "country_de_ausbildung", label: "Ausbildung in Germany", group: "Country Pathway – Germany" },

    // ...continue same pattern for every section, each with a UNIQUE value
];