import React, { createContext, useContext } from "react";

interface ConfigContextProps {
	AssetCard_SCDetails?: boolean;
	AssetCard_WRDetails?: boolean;
	LocationCard_IMDetails?: boolean;
}

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export const ConfigCardProvider: React.FC<{
	value: ConfigContextProps;
	children: React.ReactNode;
}> = ({ value, children }) => {
	return (
		<ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
	);
};

export const useConfigContext = (): ConfigContextProps => {
	const context = useContext(ConfigContext);
	if (!context) {
		throw new Error(
			"useConfigContext must be used within an ConfigCardProvider"
		);
	}
	return context;
};
