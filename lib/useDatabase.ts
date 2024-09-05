import { Alert } from "react-native";
import { useEffect, useState } from "react";

const useDatabase = <Todo2>(fn:() => Promise<Todo2[]>) => {
  const [data, setData] = useState<Todo2[] | []>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (error: any) {
      Alert.alert("Error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => fetchData();

  return { data, loading, refetch };
};

export default useDatabase;
