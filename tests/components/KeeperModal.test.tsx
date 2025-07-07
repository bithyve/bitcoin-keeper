import React from 'react';
import { fireEvent, render } from 'src/utils/test-utils';
import KeeperModal from 'src/components/KeeperModal';

// 🔧 Mocks
jest.mock('src/components/KeeperText', () => {
  return ({ children }) => <span>{children}</span>;
});

jest.mock('src/assets/images/info_icon.svg', () => 'InfoIcon');
jest.mock('src/assets/images/info-Dark-icon.svg', () => 'InfoIconDark');
jest.mock('src/assets/images/dark-close-icon.svg', () => 'CloseGreen');

jest.mock('src/components/Buttons', () => {
  return ({ primaryCallback, primaryText }) => (
    <span data-testid="btn_primaryText" onClick={primaryCallback}>
      {primaryText}
    </span>
  );
});

jest.mock('src/components/ThemedSvg.tsx/ThemedSvg', () => {
  return () => <span>MockedCloseIcon</span>;
});

jest.mock('src/hooks/useKeyboard', () => ({
  useKeyboard: () => false,
}));

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ bottom: 10 }),
}));

// ✅ Tests
describe('KeeperModal Component', () => {
  it('should render title and subtitle when visible', () => {
    const { getByTestId } = render(
      <KeeperModal visible={true} close={() => {}} title="Test Title" subTitle="Test Subtitle" />
    );

    expect(getByTestId('text_modal_title').props.children).toBe('Test Title');
    expect(getByTestId('text_modal_subtitle').props.children).toBe('Test Subtitle');
  });

  it('should not render modal when not visible', () => {
    const { queryByTestId } = render(
      <KeeperModal visible={false} close={() => {}} title="Hidden Modal" />
    );

    expect(queryByTestId('text_modal_title')).toBeNull();
  });

  it('should trigger close function on pressing close icon', () => {
    const mockClose = jest.fn();
    const { getByTestId } = render(<KeeperModal visible={true} close={mockClose} />);
    fireEvent.click(getByTestId('btn_close_modal'));
    expect(mockClose).toHaveBeenCalled();
  });

  it('should trigger learn more callback when learnMoreButton is pressed', () => {
    const mockLearnMore = jest.fn();
    const { getByTestId } = render(
      <KeeperModal
        visible={true}
        close={() => {}}
        learnMoreButton={true}
        learnMoreButtonPressed={mockLearnMore}
      />
    );
    fireEvent.press(getByTestId('btn_learnMore'));
    expect(mockLearnMore).toHaveBeenCalled();
  });

  it('should call buttonCallback on primary button press', () => {
    const mockPrimary = jest.fn();
    const { getByTestId } = render(
      <KeeperModal
        visible={true}
        close={() => {}}
        buttonText="Confirm"
        buttonCallback={mockPrimary}
      />
    );
    fireEvent.press(getByTestId('btn_primaryText'));
    expect(mockPrimary).toHaveBeenCalled();
  });
});
