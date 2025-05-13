
interface NavOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavOverlay = ({ isOpen, onClose }: NavOverlayProps) => {
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 z-40 md:hidden"
      onClick={onClose}
    />
  );
};

export default NavOverlay;
