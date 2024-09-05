import { SharedValue } from "react-native-reanimated";

  export type savedItem = {
    upc: string| null;
    item: string| null;
    aisle: number | null;
    side: "Front" | "Back" | "Endcap" | null;
  }


  export type Item2 = {
      id: string;
      aisle: number;
      bays: string[];
      item: string;
      side: "Front" | "Back";
      onTodoList: boolean;
      order?: number
    }
  export type Todo2 = {
    id: string;
   item: Item2;
    photo?: string
  }

  export type Form = {
    item: string | null;
    bays: string[] | null;
    aisle: number | null;
    side: "Front" | "Back" | "Endcap" | null;
    order?: number | null;
  }

  export type TabIconProps = {
    icon: any;
    color: string;
    name: string;
    focused: boolean;
  };

  export type Section<T> = {
    title: string;
    data: T[];
  };


  export type TItem = {
    id: number;
    title: string;
    singer: string;
    imageSrc: string;
  };

  export type TListItem = {
    item: Item2;
    isDragging: SharedValue<number>;
    draggedItemId: SharedValue<NullableNumber>;
    currentSongPositions: SharedValue<TSongPositions>;
    index: number;
  };
  export type NullableNumber = null | number;

  export type TSongPositions = {
    [key: number]: {
      updatedIndex: number;
      updatedTop: number;
    };
  };