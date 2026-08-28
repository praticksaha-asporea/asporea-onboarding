import { useState, useEffect, useMemo } from "react";
import {
  getCountriesAction,
  getPathwayPositionsAction,
  getPathwayTopLevelAction,
} from "@/Services/APIs/Pathway/pathway.action";
import { positionDBData } from "@/Types/object.types";
import { IPathway } from "@/lib/models/Pathway.model";
import { ICountry } from "@/lib/models/Country.model";

export type CategoryOption =
  | { kind: "header"; key: string; label: string; level: number }
  | { kind: "item"; key: string; value: string; label: string; level: number };

export function buildCategoryOptions(
  categories: IPathway[],
  countries: ICountry[],
): CategoryOption[] {
  const activeCategories = (categories || []).filter((c) => c.isActive);
  const roots = activeCategories.filter(
    (c) => !c.underPathway || String(c.underPathway) === "",
  );
  const getChildren = (parentId: string) =>
    activeCategories.filter((c) => String(c.underPathway) === parentId);

  const renderNode = (parent: IPathway, level = 0): CategoryOption[] => {
    const parentIdStr = String(parent._id);
    const children = getChildren(parentIdStr);

    if (children.length === 0) {
      return [
        {
          kind: "item",
          key: parentIdStr,
          value: parentIdStr,
          label: parent.title,
          level,
        },
      ];
    }

    const items: CategoryOption[] = [
      {
        kind: "header",
        key: `header-${parentIdStr}`,
        label: parent.title,
        level,
      },
    ];
    children.forEach((child) => {
      items.push(...renderNode(child, level + 1));
    });
    return items;
  };

  return roots.flatMap((root) => renderNode(root));
}

export const useInquiryCategories = () => {
  const [categories, setCategories] = useState<IPathway[]>([]);
  const [countries, setCountries] = useState<ICountry[]>([]);
  const [positionData, setPositionData] = useState<positionDBData[] | null>(
    null,
  );

  const fetchCategories = async () => {
    try {
      const response = await getPathwayTopLevelAction();
      if (response?.data?.success) setCategories(response?.data?.data);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await getCountriesAction();
      if (response?.data?.success) setCountries(response?.data?.data);
    } catch (err) {
      console.error("Country fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCountries();
  }, []);

  const fetchPositions = async (categoryId: string) => {
    if (!categoryId) {
      setPositionData(null);
      return;
    }
    try {
      const response = await getPathwayPositionsAction({
        pathwayId: categoryId,
      });

      const rawData = response?.data?.data;
      if (Array.isArray(rawData)) {
        setPositionData(rawData);
      } else if (rawData && Array.isArray((rawData as any).data)) {
        setPositionData((rawData as any).data);
      } else {
        setPositionData([]);
      }
    } catch (err) {
      console.error("Position fetch error:", err);
      setPositionData([]);
    }
  };

  const isCountryValue = (id: string) =>
    (countries || []).some((c) => String(c._id || c.code) === id);

  const categoryOptions = useMemo(
    () => buildCategoryOptions(categories, countries),
    [categories, countries],
  );

  return {
    categories,
    countries,
    positionData,
    categoryOptions,
    fetchPositions,
    isCountryValue,
  };
};
