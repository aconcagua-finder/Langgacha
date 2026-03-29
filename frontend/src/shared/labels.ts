export const LEVEL_LABELS: Record<string, string> = {
  A1: "A1",
  "A1+": "A1+",
  A2: "A2",
  "A2+": "A2+",
  B1: "B1",
  "B1+": "B1+",
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
  evolved: "Эволюция",
};

export const label = (map: Record<string, string>, key: string): string => map[key] ?? key;

export const TOOLTIPS = {
  atk: "Сила атаки карты",
  def: "Защита карты",
  conditionBrilliant: "Свежая карта, бонус к статам",
  conditionNormal: "Стандартное состояние",
  conditionWorn: "Давно не использовалась, штраф к статам",
  conditionDeteriorated: "Сильно изношена, большой штраф к статам",
  evolved: "Эволюционированная карта: +20% к базовым статам",
  wordProgress: (level: number, wordXp: number, wordXpForNext: number) =>
    wordXpForNext > 0
      ? `Уровень слова: ${level}. Прогресс: ${wordXp}/${wordXpForNext} XP`
      : `Уровень слова: ${level}. Слово достигло максимального уровня`,
  dust: "Валюта для крафта карт. Получай из боёв и распыления",
  levelProgress: "Коллекционный ранг растёт от ширины словаря и среднего уровня слов",
};

export const DISINTEGRATE_COPY = {
  title: "Распылить карту?",
  confirm: "Распылить",
  cancel: "Отмена",
  common: (dust: number) => `Вы получите ${dust} Пыль. Действие необратимо.`,
  rare: (dust: number) =>
    `Это редкая карта! Уверен?\nВы получите ${dust} Пыль. Действие необратимо.`,
};

export const EVOLVE_COPY = {
  title: "Эволюционировать карту?",
  confirm: "Эволюционировать",
  cancel: "Отмена",
  description: (dustCost: number, requiredWordLevel: number) =>
    `Нужен уровень слова ${requiredWordLevel}+.\nСтоимость эволюции: ${dustCost} Пыль.\nКарта получит +20% к ATK и DEF.`,
};
