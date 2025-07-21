import modelS from "../assets/model-s.avif";
import modelX from "../assets/model-x.avif";
import model3Old from "../assets/model-3-old.png";
import model3New from "../assets/model-3-new.avif";
import modelYOld from "../assets/model-y-old.png";
import modelYNew from "../assets/model-y-new.avif";
import { TeslaModelName } from "../types/tesla-models";

const imageMap: Record<
  TeslaModelName,
  { old: string; new?: string; newYear?: number }
> = {
  model_s: { old: modelS },
  model_x: { old: modelX },
  model_3: { old: model3Old, new: model3New, newYear: 2024 },
  model_y: { old: modelYOld, new: modelYNew, newYear: 2025 },
};

export function getVehicleImage(model: TeslaModelName, year: number): string {
  const mapping = imageMap[model];
  if (!mapping) return ""; // or a placeholder image

  if (mapping.new && mapping.newYear && year >= mapping.newYear) {
    return mapping.new;
  }
  return mapping.old;
}
