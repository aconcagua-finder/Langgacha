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

export const TOOLTIPS = {
  atk: "Сила атаки карты",
  def: "Защита карты",
  conditionBrilliant: "Свежая карта, бонус к статам",
  conditionNormal: "Стандартное состояние",
  conditionWorn: "Давно не использовалась, штраф к статам",
  conditionDeteriorated: "Сильно изношена, большой штраф к статам",
  mastery: (progress: number, masteryMax: number) =>
    `Прогресс освоения: ${progress}/${masteryMax}. Ответь правильно в бою для прокачки`,
  dust: "Валюта для крафта карт. Получай из боёв и распыления",
  levelProgress: "Осваивай карты в боях для повышения уровня и открытия новых рарностей",
};

export const DISINTEGRATE_COPY = {
  title: "Распылить карту?",
  confirm: "Распылить",
  cancel: "Отмена",
  common: (dust: number) => `Вы получите ${dust} Пыль. Действие необратимо.`,
  rare: (dust: number) =>
    `Это редкая карта! Уверен?\nВы получите ${dust} Пыль. Действие необратимо.`,
};
