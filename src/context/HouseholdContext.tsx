import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Household } from '../types';
import { subscribeToHousehold, subscribeToUserHouseholds } from '../firebase/households';
import { useAuth } from './AuthContext';

const STORAGE_KEY = 'foyer-taches:householdId';

interface HouseholdContextValue {
  households: Household[];
  householdsLoading: boolean;
  currentHousehold: Household | null;
  currentHouseholdId: string | null;
  selectHousehold: (id: string | null) => void;
}

const HouseholdContext = createContext<HouseholdContextValue>({
  households: [],
  householdsLoading: true,
  currentHousehold: null,
  currentHouseholdId: null,
  selectHousehold: () => {},
});

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [householdsLoading, setHouseholdsLoading] = useState(true);
  const [currentHouseholdId, setCurrentHouseholdId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  );
  const [currentHousehold, setCurrentHousehold] = useState<Household | null>(null);

  useEffect(() => {
    if (!user) {
      setHouseholds([]);
      setHouseholdsLoading(false);
      return;
    }
    setHouseholdsLoading(true);
    const unsubscribe = subscribeToUserHouseholds(user.uid, (list) => {
      setHouseholds(list);
      setHouseholdsLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!currentHouseholdId) {
      setCurrentHousehold(null);
      return;
    }
    const unsubscribe = subscribeToHousehold(currentHouseholdId, setCurrentHousehold);
    return unsubscribe;
  }, [currentHouseholdId]);

  // Si le foyer sélectionné n'appartient plus à l'utilisateur (quitté,
  // supprimé...), on revient à la sélection.
  useEffect(() => {
    if (!householdsLoading && currentHouseholdId && households.length > 0) {
      const stillMember = households.some((h) => h.id === currentHouseholdId);
      if (!stillMember) {
        selectHousehold(null);
      }
    }
  }, [households, householdsLoading, currentHouseholdId]);

  function selectHousehold(id: string | null) {
    setCurrentHouseholdId(id);
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const value = useMemo(
    () => ({ households, householdsLoading, currentHousehold, currentHouseholdId, selectHousehold }),
    [households, householdsLoading, currentHousehold, currentHouseholdId],
  );

  return <HouseholdContext.Provider value={value}>{children}</HouseholdContext.Provider>;
}

export function useHousehold(): HouseholdContextValue {
  return useContext(HouseholdContext);
}
