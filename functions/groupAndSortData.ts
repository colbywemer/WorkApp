import { Item2, savedItem, Section, Todo2 } from "../lib/types";


export const groupAndSortDataForBiglist = <T extends Item2 | Todo2>(
  data: T[],
  sortBy: string = "aisle"
): { items: T[][]; sectionHeaders: string[] } => {
  let parsedData: Item2[] = [];
  let isTodoType = false;

  if (data.length > 0 && "onTodoList" in data[0]) {
    parsedData = data as Item2[];
  } else {
    parsedData = (data as Todo2[]).map((todo) => todo.item);
    isTodoType = true;
  }

  const sortedData = [...parsedData];

  sortedData.sort((a, b) => {
    if (sortBy === "aisle") {
      if (a.aisle !== b.aisle) {
        return a.aisle - b.aisle;
      }
      return a.side === b.side ? 0 : a.side === "Front" ? -1 : 1;
    } else if (sortBy === "bay") {
      const hasTrailer = (bays: string[]) => bays.includes("Trailer");

      const sortBayArray = (bayA: string[], bayB: string[]) => {
        if (hasTrailer(bayA) && !hasTrailer(bayB)) return 1;
        if (!hasTrailer(bayA) && hasTrailer(bayB)) return -1;
        return 0;
      };

      sortedData.sort((a, b) => {
        if (hasTrailer(a.bays) && !hasTrailer(b.bays)) return 1;
        if (!hasTrailer(a.bays) && hasTrailer(b.bays)) return -1;
        if (a.bays.length === 0 && b.bays.length === 0) return 0;
        if (a.bays.length === 0) return -1;
        if (b.bays.length === 0) return 1;
        return sortBayArray(a.bays, b.bays);
      });
    }
    return 0;
  });

  const groupedData: { [key: string]: Item2[] } = {};
  sortedData.forEach((item) => {
    if (sortBy === "aisle") {
      const key = `Aisle ${item.aisle} - ${item.side}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);
    } else if (sortBy === "bay") {
      item.bays.forEach((bay) => {
        const key = `${bay === "Trailer" ? "" : "Bay"} ${bay}`;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(item);
      });

      if (item.bays.length === 0) {
        const key = "No Bay Assigned";
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(item);
      }
    }
  });

  const sectionHeaders = Object.keys(groupedData).sort((a, b) => {
    if (sortBy === "aisle") {
      const aisleA = parseInt(a.split(" ")[1], 10);
      const aisleB = parseInt(b.split(" ")[1], 10);
      return aisleA - aisleB;
    } else if (sortBy === "bay") {
      const regex = /([A-Z])(\d+)/;
      const matchA = a.match(regex);
      const matchB = b.match(regex);
      if (matchA && matchB) {
        const letterA = matchA[1];
        const numberA = parseInt(matchA[2], 10);
        const letterB = matchB[1];
        const numberB = parseInt(matchB[2], 10);
        if (letterA < letterB) return -1;
        if (letterA > letterB) return 1;
        return numberA - numberB;
      }
    }
    return 0;
  });

  const items = sectionHeaders.map((header) =>
    groupedData[header] .sort((a, b) => {
      if (isTodoType) {
        const todoA = (data as Todo2[]).find(todo => todo.item.id === a.id);
        const todoB = (data as Todo2[]).find(todo => todo.item.id === b.id);
        if (todoA && todoB) {
          return todoA.item.order! - todoB.item.order!;
        }
      }
      return a.order! - b.order!;
    }).map((item) => {
      if (isTodoType) {
        return (data as Todo2[]).find(todo => todo.item.id === item.id) as T;
      }
      return item as T;
    })
  );

  return { items, sectionHeaders };
};

export const groupAndSortSavedItemDataForBiglist = (
  data: savedItem[],
): { items: savedItem[][]; sectionHeaders: string[] } => {
  const sortedData = [...data];

  sortedData.sort((a, b) => {
      if (a.aisle !== b.aisle) {
        return a.aisle! - b.aisle!;
      }
      return a.side === b.side ? 0 : a.side === "Front" ? -1 : 1;
  });
  const groupedData: { [key: string]: savedItem[] } = {};
  sortedData.forEach((item) => {
      const key = `Aisle ${item.aisle} - ${item.side}`;
      if (!groupedData[key]) {
        groupedData[key] = [];
      }
      groupedData[key].push(item);

  });

  const sectionHeaders = Object.keys(groupedData).sort((a, b) => {
      const aisleA = parseInt(a.split(" ")[1], 10);
      const aisleB = parseInt(b.split(" ")[1], 10);
      return aisleA - aisleB;
  });

  const items = sectionHeaders.map((header) =>
    groupedData[header].map((item) => {
      return item;
    })
  );

  return { items, sectionHeaders };
};