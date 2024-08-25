import { Box } from "@mui/material";
import Quagga from "quagga";
import { useEffect, useRef } from "react";
import snackbar from "../snackbar/snackbar";

interface BarcodeScannerProps {
  onCodeScanned: (code: string) => void;
  onClose: () => void;
  t: Function;
}

export default function BarcodeScanner({
  onCodeScanned,
  onClose,
  t,
}: BarcodeScannerProps) {
  const barcodeScannerRef = useRef<HTMLDivElement | null>(null);

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
        snackbar("errors.productScan", "info", t);
        return;
      }
      Quagga.start();
    }
  );

  const handleBarcodeDetection = (result: { codeResult: { code: any } }) => {
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
          height: "100%",
          objectFit: "cover",
          borderRadius: "20px",
        },
        "& canvas": {
          display: "none",
        },
      }}
    />
  );
}
