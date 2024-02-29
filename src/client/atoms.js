import getAPIFromAtoms from "jotai-wrapper";
import { atom, Provider } from "jotai";

export const { useAtom, useAtomValue, useSetAtom, getAtom, selectAtom } =
  getAPIFromAtoms({
    counter: atom(0),
  });

export default Provider;
