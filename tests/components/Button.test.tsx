jest.mock('src/components/KeeperText', () => {
  return ({ children }) => <span>{children}</span>;
});

import React from 'react';
import Buttons from 'src/components/Buttons';
import { fireEvent, render } from 'src/utils/test-utils';

jest.mock('react-native-device-info', () => ({
  getVersion: () => '1.0.0',
  getBuildNumber: () => '100',
  getSystemName: () => 'iOS',
  getUniqueId: () => 'mocked-device-id',
  getManufacturer: () => Promise.resolve('MockedManufacturer'),
}));

describe('Buttons Component', () => {
  it('renders primary button', () => {
    const { getByTestId } = render(<Buttons primaryText="Submit" />);
    expect(getByTestId('btn_primaryText')).toBeTruthy();
  });

  it('calls primaryCallback when pressed', () => {
    const mockPrimary = jest.fn();
    const { getByTestId } = render(<Buttons primaryText="Submit" primaryCallback={mockPrimary} />);
    fireEvent.press(getByTestId('btn_primaryText'));
    expect(mockPrimary).toHaveBeenCalled();
  });

  it('does not call primaryCallback when disabled', () => {
    const mockPrimary = jest.fn();
    const { getByTestId } = render(
      <Buttons primaryText="Submit" primaryCallback={mockPrimary} primaryDisable />
    );
    fireEvent.press(getByTestId('btn_primaryText'));
    expect(mockPrimary).not.toHaveBeenCalled();
  });

  it('shows loading indicator when primaryLoading is true', () => {
    const { getByTestId } = render(<Buttons primaryText="Submit" primaryLoading />);
    expect(getByTestId('activityIndicator')).toBeTruthy();
  });

  it('renders and triggers secondary button callback', () => {
    const mockSecondary = jest.fn();
    const { getByTestId } = render(
      <Buttons primaryText="Save" secondaryText="Cancel" secondaryCallback={mockSecondary} />
    );
    expect(getByTestId('btn_secondaryText')).toBeTruthy();
    fireEvent.press(getByTestId('btn_secondaryText'));
    expect(mockSecondary).toHaveBeenCalled();
  });

  it('does not trigger secondaryCallback when disabled', () => {
    const mockSecondary = jest.fn();
    const { getByTestId } = render(
      <Buttons
        primaryText="Save"
        secondaryText="Cancel"
        secondaryCallback={mockSecondary}
        secondaryDisable
      />
    );
    fireEvent.press(getByTestId('btn_secondaryText'));
    expect(mockSecondary).not.toHaveBeenCalled();
  });
});
