import Quagga from "quagga";
import Box from "@mui/material/Box";
import snackbar from "~/utils/snackbar/snackbar";

interface BarcodeScannerProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
  t: Function;
}

export default function Scanner({
  onCodeScanned,
  onClose,
  t,
}: BarcodeScannerProps) {
  useEffect(() => {
    Quagga.init(
      {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: document.querySelector("#quagga-scanner"),
        },
        decoder: {
          readers: ["ean_reader"],
        },
      },
      (err: any) => {
        if (err) {
          snackbar("error_message.scan", "error", t);
          return;
        }
        Quagga.start();
      }
    );

    const handleBarcodeDetection = (result: { codeResult: { code: any; }; }) => {
      const code = result.codeResult.code;
      onCodeScanned(code);
      onClose();
    };

    Quagga.onDetected(handleBarcodeDetection);

    return () => {
      Quagga.offDetected(handleBarcodeDetection);
      Quagga.stop();
    };
  }, [onCodeScanned, onClose]);

  return (
    <Box
      id="quagga-scanner"
      position="relative"
      component="div"
      sx={{
        "& video": {
          width: "100%",
          height: "87vh",
          objectFit: "cover",
        },
        "& canvas": {
          display: "none",
        },
      }}
    />
  );
}
function useEffect(arg0: () => () => void, arg1: ((code: string) => void)[]) {
  throw new Error("Function not implemented.");
}

