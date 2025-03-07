import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";

const ImageDialog = ({ dialogIsOpen, onDialogClose, url }: any) => {

    console.log(url)
  return (
    <Lightbox
      plugins={[Zoom]}
      open={dialogIsOpen}
      close={onDialogClose}
      slides={[{ src: url }]}
      zoom={{
        maxZoomPixelRatio: 5, // Increase this for stronger zoom
        scrollToZoom: true, // Enables zooming using the scroll wheel
      }}
    />
  );
};

export default ImageDialog;
