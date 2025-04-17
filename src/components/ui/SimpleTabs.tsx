import React, { useState } from 'react';

interface TabProps {
  children: React.ReactNode;
  className?: string | ((props: { selected: boolean }) => string);
}

interface TabsProps {
  children: React.ReactNode;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

interface TabListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabPanelsProps {
  children: React.ReactNode;
  className?: string;
}

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

const TabContext = React.createContext<{
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  registerTab: (index: number) => void;
}>({
  selectedIndex: 0,
  setSelectedIndex: () => {},
  registerTab: () => {},
});

export const Tabs: React.FC<TabsProps> = ({
  children,
  selectedIndex = 0,
  onChange,
  className = ''
}) => {
  const [internalSelectedIndex, setInternalSelectedIndex] = useState(selectedIndex);
  const [tabCount, setTabCount] = useState(0);

  const registerTab = (index: number) => {
    setTabCount(Math.max(tabCount, index + 1));
  };

  const handleTabChange = (index: number) => {
    setInternalSelectedIndex(index);
    if (onChange) {
      onChange(index);
    }
  };

  return (
    <TabContext.Provider
      value={{
        selectedIndex: selectedIndex ?? internalSelectedIndex,
        setSelectedIndex: handleTabChange,
        registerTab,
      }}
    >
      <div className={className}>
        {children}
      </div>
    </TabContext.Provider>
  );
};

export const TabList: React.FC<TabListProps> = ({ children, className = '' }) => {
  return (
    <div className={className} role="tablist">
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
          });
        }
        return child;
      })}
    </div>
  );
};

export const Tab: React.FC<TabProps & { index?: number }> = ({
  children,
  className = '',
  index = 0
}) => {
  const { selectedIndex, setSelectedIndex, registerTab } = React.useContext(TabContext);

  React.useEffect(() => {
    if (typeof index === 'number') {
      registerTab(index);
    }
  }, [index, registerTab]);

  const isSelected = selectedIndex === index;

  const handleClick = () => {
    setSelectedIndex(index);
  };

  // If className is a function, call it with the selected state
  const resolvedClassName = typeof className === 'function'
    ? className({ selected: isSelected })
    : className;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      tabIndex={isSelected ? 0 : -1}
      onClick={handleClick}
      className={resolvedClassName}
    >
      {children}
    </button>
  );
};

export const TabPanels: React.FC<TabPanelsProps> = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            index,
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabPanel: React.FC<TabPanelProps & { index?: number }> = ({
  children,
  className = '',
  index = 0
}) => {
  const { selectedIndex } = React.useContext(TabContext);
  const isSelected = selectedIndex === index;

  if (!isSelected) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      tabIndex={0}
      className={className}
    >
      {children}
    </div>
  );
};

// Create a namespace-like object for easier migration from headlessui
const SimpleTabs = {
  Group: Tabs,
  List: TabList,
  Tab,
  Panels: TabPanels,
  Panel: TabPanel,
};

export default SimpleTabs;
