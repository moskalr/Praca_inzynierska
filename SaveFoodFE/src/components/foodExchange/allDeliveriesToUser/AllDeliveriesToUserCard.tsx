import EventBusyIcon from "@mui/icons-material/EventBusy";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { secondary } from "../../../constants/colors";
import { HTTP_PATCH } from "../../../constants/httpMethods";
import {
  CLIENT_ADMIN,
  CLIENT_MODERATOR,
  CLIENT_USER,
  CLIENT_VOLUNTEER,
} from "../../../constants/roles";
import { foodExchangeUrl } from "../../../constants/url/foodExchange";
import { DeliveryToUser, ExchangeState, Product } from "../../../type/mzwz";
import fetchWithAuthorization from "../../../utils/axios/fetchWrapper";
import { formatDateToDisplay } from "../../../utils/date/date";
import snackbarTranslated from "../../../utils/snackbar/snackbarTranslated";
import { UserContext } from "../../context/UserContextProvider";
import DetailsCardDeliveryToUser from "../cards/DetailsCardDeliveryToUser";
import MakeReservationDeliveryToUser from "../reservationDeliveryToUserStepper/MakeReservationDeliveryToUser";

const translation = "Tabs.AllDeliveries.DeliveryCard.";
const translationRequests = "Tabs.AllDeliveries.DeliveryCard.Requests.";

const allowedRoles = [CLIENT_VOLUNTEER, CLIENT_ADMIN, CLIENT_USER];
const allowedCancelDeliveryRoles = [CLIENT_ADMIN, CLIENT_MODERATOR];
interface ReservationButtonProps {
  currentRole: string;
  handleTogleStepper: () => void;
  isStepperOpen: boolean;
  deliveryToUser: DeliveryToUser;
  t: any;
  index: number;
  removeDeliveryFromList: (index: number) => void;
}
const ReservationButton = ({
  currentRole,
  handleTogleStepper,
  isStepperOpen,
  deliveryToUser,
  index,
  removeDeliveryFromList,
  t,
}: ReservationButtonProps) => {
  if (!allowedRoles.includes(currentRole)) {
    return <> </>;
  }
  return (
    <>
      <Button
        onClick={handleTogleStepper}
        variant="contained"
        disabled={deliveryToUser.deliveryState === "RESERVED"}
      >
        {t(translation + "reservationButton")}
      </Button>

      {isStepperOpen && (
        <MakeReservationDeliveryToUser
          open={isStepperOpen}
          onClose={handleTogleStepper}
          deliveryToUser={deliveryToUser}
          index={index}
          removeDeliveryFromList={removeDeliveryFromList}
        />
      )}
    </>
  );
};

interface DeliveryToUserProps {
  deliveryToUser: DeliveryToUser;
  index: number;
  removeDeliveryFromList: (index: number) => void;
}

function AllDeliveriesToUserCard({
  deliveryToUser,
  index,
  removeDeliveryFromList,
}: DeliveryToUserProps) {
  const [isStepperOpen, setIsStepperOpen] = useState(false);

  const [productPatch, setProductPatch] = useState<Product>();
  const [tabValue, setTabValue] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation("foodExchange");
  const { currentRole } = useContext(UserContext);
  const [isDialogDetailsDeliveryOpen, setIsDialogDetailsDetailsDeliveryOpen] =
    useState(false);
  const allowCancelDeliveryReservation = () => {
    if (
      (deliveryToUser.exchange.exchangeState ===
        ExchangeState.WAITING_FOR_RECEIPT_PRODUCT ||
        deliveryToUser.exchange.exchangeState ===
          ExchangeState.WAITING_FOR_RESERVED_DELIVERY) &&
      allowedCancelDeliveryRoles.includes(currentRole)
    ) {
      return true;
    }
  };

  const setUpdatedDelivery = (
    index: number,
    deliveryToUser: DeliveryToUser
  ) => {
    return;
  };

  const cancelReservation = async (event: React.FormEvent) => {
    event.preventDefault();

    const redDeliveryToUserId = deliveryToUser.id;
    const path = "/deliveryState";

    const requestOptions = {
      body: JSON.stringify({
        value: "WAITING_FOR_VOLUNTEER",
      }),
      headers: {
        "If-Match": deliveryToUser.etag,
      },
    };

    const response = await fetchWithAuthorization(
      `${foodExchangeUrl}deliveryToUser/${redDeliveryToUserId}/${path}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((res: Response) => {
        res
          .json()
          .then((resAxios) => {
            if (res.ok) {
              snackbarTranslated(
                t(translationRequests + "CancelReservation.success"),
                "success"
              );
              removeDeliveryFromList(index);
              return;
            }
            if (resAxios.key !== undefined) {
              snackbarTranslated(
                t(
                  translationRequests +
                    "CancelReservation.Error." +
                    resAxios.key
                ),
                "error"
              );
              return;
            }
            throw new Error();
          })
          .catch((error) => {
            snackbarTranslated(
              t(translationRequests + "CancelReservation.Error.general"),
              "error"
            );
          });
      })
      .catch((error) => {
        snackbarTranslated(
          t(translationRequests + "CancelReservation.Error.general"),
          "error"
        );
      });
  };

  const handleDetailsDeliveryDialog = () => {
    setIsDialogDetailsDetailsDeliveryOpen((prev) => !prev);
  };

  const handleTogleStepper = () => {
    setIsStepperOpen((prev) => !prev);
  };

  return (
    <Card
      sx={{
        margin: 2,
        transform: "scale(1)",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.03)",
        },
      }}
      elevation={4}
      key={deliveryToUser.id}
    >
      <CardHeader
        action={
          <>
            {allowCancelDeliveryReservation() && (
              <IconButton>
                <EventBusyIcon onClick={cancelReservation} />
              </IconButton>
            )}
          </>
        }
        title={deliveryToUser.exchange.product.name}
        style={{ color: secondary }}
      ></CardHeader>
      <CardContent>
        <Grid container justifyContent="flex-start">
          <Grid item xs={6}>
            <Typography variant="body1">
              {t(
                translation +
                  "Categories." +
                  deliveryToUser.exchange.product.categories?.toLowerCase()
              )}
            </Typography>
            <Typography variant="body1">
              {formatDateToDisplay(
                deliveryToUser.exchange.product.startExchangeTime
              )}
              {" - "}
              {formatDateToDisplay(
                deliveryToUser.exchange.product.endExchangeTime
              )}
            </Typography>

            <Typography variant="body1">
              {t(
                translation + "DeliveryStates." + deliveryToUser.deliveryState
              )}
            </Typography>
          </Grid>
          <Grid
            container
            item
            direction="column"
            xs={6}
            justifyContent="flex-end"
            alignItems={"flex-end"}
            spacing={1}
          >
            <Box display="flex" flexDirection="column" width="80%">
              <ReservationButton
                currentRole={currentRole}
                handleTogleStepper={handleTogleStepper}
                isStepperOpen={isStepperOpen}
                deliveryToUser={deliveryToUser}
                index={index}
                removeDeliveryFromList={removeDeliveryFromList}
                t={t}
              />
              <Button
                size="small"
                variant="contained"
                onClick={handleDetailsDeliveryDialog}
              >
                {t(translation + "detailsButton")}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
      {isDialogDetailsDeliveryOpen && (
        <DetailsCardDeliveryToUser
          open={isDialogDetailsDeliveryOpen}
          deliveryToUser={deliveryToUser}
          handleSetOpen={handleDetailsDeliveryDialog}
          setUpdatedDelivery={setUpdatedDelivery}
          index={index}
        />
      )}
    </Card>
  );
}
export default AllDeliveriesToUserCard;
