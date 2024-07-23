import { useState } from 'react';

type InferArrayElements<T> = T extends ReadonlyArray<infer U> ? U : never;

/**
 *
 * @param options List of string values for selector input
 * @returns options (same as input), selected (type of any elements from options), setSelected
 */
const useHorizontalSelectorInput = <T extends ReadonlyArray<string>>(options: T) => {
    type OptionType = InferArrayElements<T>;

    const [selected, setSelected] = useState<OptionType>(options[0] as OptionType);

    return {
        selected,
        setSelected: (newValue: OptionType) => setSelected(newValue),
        options,
    };
};

export default useHorizontalSelectorInput;
