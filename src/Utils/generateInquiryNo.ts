import { GeneralSettingModel } from "@/lib/models/GeneralSetting.model";
import { Lead } from "@/lib/models/Lead.model";
import { currentFy } from "./common";

export const generateInquiryNo = async (): Promise<string> => {

  const currentFYear = currentFy();

  let settings = await GeneralSettingModel.findOne();

  if (!settings) {
    settings = await GeneralSettingModel.create({
      lastInq: 0,
      lastFy: currentFYear,
      inquiryNumberFormat: "ASP-INQ-00000",
    });
  }

  // Reset counter on FY change
  if (settings.lastFy !== currentFYear) {
    settings.lastFy = currentFYear;
    settings.lastInq = 0;
  }

  const format = settings.inquiryNumberFormat || "ASP-INQ-00000";

  const generateNumber = (num: number) => {
    const zeroMatch = format.match(/0+$/);

    if (!zeroMatch) {
      return `${format}${num}`;
    }

    const digits = zeroMatch[0].length;

    return format.replace(
      /0+$/,
      String(num).padStart(digits, "0")
    );
  };

  let nextInqNo = settings.lastInq + 1;
  let inquiryNo = generateNumber(nextInqNo);

  // Ensure unique number
  while (
    await Lead.exists({
      inquiryNo,
    })
  ) {
    nextInqNo++;
    inquiryNo = generateNumber(nextInqNo);
  }

  settings.lastInq = nextInqNo;
  settings.lastFy = currentFYear;

  await settings.save();

  return inquiryNo;
};