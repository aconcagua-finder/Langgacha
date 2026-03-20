export const LEVEL_LABELS: Record<string, string> = {
  Beginner: "Начинающий",
  Elementary: "Базовый",
  Intermediate: "Средний",
  Advanced: "Продвинутый",
  Master: "Мастер",
};

export const CONDITION_LABELS: Record<string, string> = {
  Brilliant: "Блестящая",
  Normal: "Обычная",
  Worn: "Потёртая",
  Deteriorated: "Ветхая",
};

export const RARITY_LABELS: Record<string, string> = {
  C: "Обычная",
  UC: "Необычная",
  R: "Редкая",
  SR: "Супер редкая",
  SSR: "Легендарная",
};

export const TYPE_LABELS: Record<string, string> = {
  Person: "Персона",
  Place: "Место",
  Action: "Действие",
  Object: "Предмет",
  Emotion: "Эмоция",
  Expression: "Выражение",
};

export const BATTLE_LABELS = {
  inspiration: "Воодушевление",
  mastered: "Освоена",
};

export const label = (map: Record<string, string>, key: string): string => map[key] ?? key;

