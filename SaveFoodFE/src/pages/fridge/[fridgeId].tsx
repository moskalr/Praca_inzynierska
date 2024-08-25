import CachedIcon from "@mui/icons-material/Cached";
import { Box, Grid, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grow from "@mui/material/Grow";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import TextField from "@mui/material/TextField";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Modal from "react-modal";
import CategoryDisplay from "../../components/category/CategoryDisplay";
import { UserContext } from "../../components/context/UserContextProvider";
import EditFridge from "../../components/fridge/EditFridge";
import UpdateFridge from "../../components/fridge/UpdateFridge";
import FridgeData from "../../components/fridge/hooks/FridgeData";
import FileInput from "../../components/fridge/useFormInput/FileInput";
import { primary, secondary } from "../../constants/colors";
import { HTTP_OK, HTTP_UNAUTHORIZED } from "../../constants/httpCodes";
import {
  HTTP_GET,
  HTTP_PATCH,
  HTTP_POST,
  HTTP_PUT,
} from "../../constants/httpMethods";
import { AVAILABLE } from "../../constants/productState";
import {
  CLIENT_GUEST,
  CLIENT_MANAGER,
  CLIENT_USER,
} from "../../constants/roles";
import { ACTIVE, ARCHIVED, INACTIVE } from "../../constants/socialFridgeStates";
import {
  Account,
  Address,
  LatLng,
  Product,
  ProductList,
} from "../../type/mzls";
import fetchWithAuthorization from "../../utils/axios/fetchWrapper";
import getProductUnit from "../../utils/unit/getProductUnit";
import ConfirmationDialog from "../../components/confirm/ConfirmationDialog";
import AddProduct from "../../components/fridge/AddProduct";
import EditRating from "../../components/fridge/EditRating";
import Map from "../../components/map";
import ProductCard from "../../components/product/ProductCard";
import styles from "../../styles/fridge.module.css";
import mapStyles from "../../styles/map.module.css";
import LoadingSpinner from "../../utils/loading_spinner/LoadingSpinner";
import { getUserLocation } from "../../utils/location/location";
import snackbar from "../../utils/snackbar/snackbar";
import { AddProductFormValidation } from "../../utils/validation/MzlsFormsValidation";
import foodDonor from "/public/icons/food-donor.png";
import openIconUrl from "/public/icons/open-fridge.png";
import smallerIconUrl from "/public/icons/service-fridge.png";

const dictionary = "social-fridge";

export async function getServerSideProps({
  locale,
  req,
}: {
  locale: string;
  req: any;
}) {
  const currentRole = req.session?.currentRole || CLIENT_GUEST;
  const allowedRoles = [CLIENT_GUEST, CLIENT_USER, CLIENT_MANAGER];
  if (!allowedRoles.includes(currentRole)) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      ...(await serverSideTranslations(locale, [dictionary, "navbar"])),
    },
  };
}

enum DialogType {
  None,
  AddProduct,
  UpdateFridge,
  EditFridge,
}

type TFormValues = {
  description: string;
  image: File | null;
};

export function Fridge() {
  const { t } = useTranslation(dictionary);
  const router = useRouter();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const { fridgeId } = router.query;
  const fridgeIdNumber = isNaN(Number(fridgeId)) ? undefined : Number(fridgeId);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLImageElement | null>(null);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [stateConfirmationOpen, setStateConfirmationOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [userLocation, setUserLocation] = useState<LatLng>();
  const [currentDialog, setCurrentDialog] = useState(DialogType.None);
  const [managers, setManagers] = useState<Account[]>([]);
  const { currentRole } = useContext(UserContext);
  const [nNewSocialFridgeState, setNewSocialFridgeState] = useState<string>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [openProductDialog, setOpenProductDialog] = useState(false);
  const [productETag, setProductETag] = useState();
  const [addreessETag, setAddressETag] = useState();
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const validationRules = AddProductFormValidation(t);
  const {
    socialFridge,
    loadingState,
    setSocialFridge,
    setManager,
    setAddress,
    setProductState,
    socialFridgeETag,
    fetchData,
    addProduct,
  } = FridgeData(fridgeIdNumber, t, router);
  const defaultValues: TFormValues = {
    description: "",
    image: null,
  };
  const { handleSubmit, control, watch, setValue, reset } = useForm({
    defaultValues: defaultValues,
  });

  useEffect(() => {
    getUserLocation(t).then((location) => {
      setUserLocation(location);
    });
  }, []);

  const successArchive = async () => {
    if (socialFridge && socialFridge.products) {
      const availableProducts = socialFridge.products.filter(
        (product) => product.state === AVAILABLE
      );

      setSocialFridge((prevSocialFridge) => ({
        ...prevSocialFridge!,
        products: availableProducts,
      }));
    }
  };

  const fetchManagersData = async () => {
    const fullPath = `/api/social-fridge/managers`;

    await fetchWithAuthorization(fullPath, HTTP_GET)
      .then((response) => {
        if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        }
        return response.json();
      })
      .then((data) => {
        setManagers(data.managers);
      })
      .catch((error) => {
        snackbar("errors.error", "error", t);
      });
  };

  const newSuggestion = async () => {
    const { description, image } = watch();
    let imageURL;
    if (image) {
      const formData = new FormData();
      formData.append("image", image);

      await fetch("/api/cloudinary", {
        method: HTTP_POST,
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            `Request to Cloudinary failed with status: ${response.status}`;
          }
          return response.json().then(async (cloudinaryData) => {
            imageURL = await cloudinaryData.imageUrl;
          });
        })
        .catch(() => {
          snackbar("errors.cloudinary", "info", t);
        });
    }

    const postData = {
      socialFridgeId: socialFridge?.id,
      description,
      latitude: userLocation?.lat,
      longitude: userLocation?.lng,
      image: imageURL,
    };

    const requestOptions = {
      body: JSON.stringify({
        postData: postData,
      }),
    };

    fetchWithAuthorization(
      `/api/social-fridge/suggestions`,
      HTTP_POST,
      requestOptions
    )
      .then((response) => {
        return response.json().then((data) => {
          if (response.ok) {
            reset(defaultValues);
            snackbar("fridge.successes.newSuggestion", "success", t);
          } else if (response.status === HTTP_UNAUTHORIZED) {
            snackbar("errors.unauthorized", "error", t);
            router.push("/login");
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.newSuggestionError", "error", t);
      });
    setOpenDialog(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  const handleConfirmStateChange = (value: string) => {
    setNewSocialFridgeState(value);
    setStateConfirmationOpen(true);
    setConfirmationDialogOpen(true);
  };

  const handleCloseConfirmationDialog = () => {
    setConfirmationDialogOpen(false);
    setStateConfirmationOpen(false);
  };

  const handleConfirmationConfirm = () => {
    let value;
    let path;

    const requestOptions = {
      body: JSON.stringify({
        value: nNewSocialFridgeState,
        path: "/state",
      }),
      headers: {
        "If-Match": socialFridgeETag,
      },
    };

    fetchWithAuthorization(
      `/api/social-fridge/fridge/${fridgeId}`,
      HTTP_PATCH,
      requestOptions
    )
      .then((response) => {
        return response.json().then((data) => {
          if (response.ok) {
            snackbar("fridge.successes.success", "success", t);
            setSocialFridge(data.fridge);
          } else if (response.status === HTTP_UNAUTHORIZED) {
            snackbar("errors.unauthorized", "error", t);
            router.push("/login");
          } else if (data.error.key !== undefined) {
            snackbar(`errors.${data.error.key}`, "error", t);
          }
        });
      })
      .catch(() => {
        snackbar("errors.update_error", "error", t);
      });

    setConfirmationDialogOpen(false);
    setOpen(false);
  };

  const fetchProduct = async (id: number) => {
    await fetchWithAuthorization(
      `/api/social-fridge/product/${id}`,
      HTTP_GET
    ).then((response) => {
      return response.json().then((data) => {
        if (response.ok) {
          setSelectedProduct(data.product);
          setProductETag(data.eTag);
        } else if (response.status === HTTP_UNAUTHORIZED) {
          snackbar("errors.unauthorized", "error", t);
          router.push("/login");
        } else if (data.error.key !== undefined) {
          snackbar(`errors.${data.error.key}`, "error", t);
        }
      });
    });
  };

  const getMessageAction = () => {
    if (nNewSocialFridgeState === ARCHIVED) {
      return t("fridge.confirm_actions.confirm_archive");
    } else if (nNewSocialFridgeState === INACTIVE) {
      return t("fridge.confirm_actions.confirm_deactivate");
    } else if (nNewSocialFridgeState === ACTIVE) {
      return t("fridge.confirm_actions.confirm_activate");
    }
  };

  const fetchAddressData = async () => {
    const fullPath = `/api/social-fridge/address/${socialFridge?.address.id}`;

    await fetchWithAuthorization(fullPath, HTTP_GET)
      .then((response) => {
        if (response.status !== HTTP_OK) {
          setCurrentDialog(DialogType.None);
          if (response.status === HTTP_UNAUTHORIZED) {
            snackbar("errors.unauthorized", "error", t);
            router.push("/login");
          }
        }
        return response.json();
      })
      .then((data) => {
        setAddressETag(data.eTag);
      });
  };

  const handleEditFridge = async () => {
    await fetchManagersData();
    await fetchAddressData();
    setCurrentDialog(DialogType.EditFridge);
  };

  const handleEditManager = (newManager: Account) => {
    setManager(newManager);
  };

  const handleEditAddress = (newAddress: Address) => {
    setAddress(newAddress);
  };

  const openProductDetailsDialog = (productId: number) => {
    fetchProduct(productId);
    setOpenProductDialog(true);
  };

  const closeProductDetailsDialog = () => {
    setOpenProductDialog(false);
  };

  const formatUnixTimestamp = ([year, month, day, hour, minute]: number[]) => {
    if (year !== undefined && month !== undefined) {
      const date = new Date(year, month - 1, day, hour, minute);
      return new Intl.DateTimeFormat("pl-PL").format(date);
    }
  };

  const archiveProduct = async (product: Product) => {
    if (selectedProduct) {
      await getUserLocation(t).then((location) => {
        setUserLocation(location);
      });

      const putData = {
        id: product.id,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
      };

      const requestOptions = {
        body: JSON.stringify({
          putData: putData,
        }),
        headers: {
          "If-Match": productETag,
        },
      };

      await fetchWithAuthorization(
        `/api/social-fridge/product/${selectedProduct.id}`,
        HTTP_PUT,
        requestOptions
      )
        .then((response) => {
          return response.json().then((data) => {
            if (response.ok) {
              snackbar("fridge.successes.product_success", "success", t);
              setProductState(data.product.state, selectedProduct.id);
              successArchive();
            } else if (response.status === HTTP_UNAUTHORIZED) {
              snackbar("errors.unauthorized", "error", t);
              router.push("/login");
            } else if (data.error.key !== undefined) {
              snackbar(`errors.${data.error.key}`, "error", t);
            }
          });
        })
        .catch(() => {
          snackbar("errors.product_update_error", "error", t);
        });
    }
    setSelectedProduct(null);
    setConfirmationOpen(false);
  };

  const closeConfirmationDialog = () => {
    setSelectedProduct(null);
    setConfirmationOpen(false);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleProductAdded = async (products: ProductList[]) => {
    {
      products?.map((product: ProductList) => addProduct(product));
    }
    successArchive();
  };

  return (
    <div>
      <LoadingSpinner open={loadingState} />

      <Image
        alt="Open Fridge"
        src={openIconUrl}
        layout="fixed"
        className={styles["image-open-fridge"]}
      />
      {socialFridge &&
        currentRole === CLIENT_USER &&
        socialFridge.state === ACTIVE && (
          <div className={styles["average"]}>
            <EditRating fridgeId={socialFridge.id} t={t} />
          </div>
        )}

      <div
        onClick={() => setModalIsOpen(true)}
        className={mapStyles["map-container"]}
      >
        {socialFridge && (
          <Map socialFridges={[socialFridge]} mapLabel={t("grade")} />
        )}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className={mapStyles["modal-content"]}
        overlayClassName={mapStyles["modal-overlay"]}
        shouldCloseOnOverlayClick={true}
      >
        {socialFridge && (
          <Map socialFridges={[socialFridge]} mapLabel={t("grade")} />
        )}
      </Modal>
      <div className={styles.products}>
        <IconButton onClick={handleRefresh}>
          <CachedIcon />
        </IconButton>
        <h2>{t("fridge.messages.products")}</h2>
      </div>

      <Box className={styles["product-card-section"]}>
        {socialFridge?.products.map((product: ProductList) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetails={openProductDetailsDialog}
            t={t}
          />
        ))}
      </Box>

      <Dialog
        open={openProductDialog}
        onClose={closeProductDetailsDialog}
        aria-labelledby="product-details-dialog"
        maxWidth="sm"
        fullWidth
        className={styles["product-dialog"]}
      >
        <DialogTitle className={styles["details-title"]}>
          {t("product.details.detailsTitle")}
          {(currentRole === CLIENT_MANAGER || currentRole === CLIENT_USER) &&
            socialFridge?.state === ACTIVE && (
              <IconButton
                className={styles["open-fridge-button"]}
                onClick={() => {
                  closeProductDetailsDialog();
                  setConfirmationOpen(true);
                }}
              >
                <Image
                  src={foodDonor}
                  alt="Food Donor"
                  layout="fixed"
                  width={40}
                  height={40}
                />
              </IconButton>
            )}
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <div>
              <Typography variant="h6">{selectedProduct.title}</Typography>
              <CategoryDisplay
                categories={selectedProduct.categories}
                message={t("product.details.categoryLabel")}
                t={t}
              />
              <Typography variant="body2">
                {t("product.details.expirationDate")}
                {formatUnixTimestamp(selectedProduct.expirationDate)}
              </Typography>
              <Typography variant="body2">
                {t("product.details.size")} {selectedProduct.size}{" "}
                {getProductUnit(selectedProduct.productUnit)}
              </Typography>
              <Typography variant="body2">
                {t("product.details.description")}
                {selectedProduct.description}
              </Typography>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeProductDetailsDialog} color="secondary">
            {t("product.details.closeButton")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={closeConfirmationDialog}
        onConfirm={() => {
          if (selectedProduct) {
            archiveProduct(selectedProduct);
            closeConfirmationDialog();
          }
        }}
        message={t("fridge.confirm_actions.confirm_pull")}
        t={t}
      />

      {socialFridge && (
        <div className={styles["fridge-state-message"]}>
          {(() => {
            switch (socialFridge.state) {
              case ARCHIVED:
                return (
                  <p style={{ color: "grey" }}>
                    {t("fridge.messages.socialFridgeArchived")}
                  </p>
                );
              case ACTIVE:
                return (
                  <p style={{ color: "green" }}>
                    {t("fridge.messages.socialFridgeActive")}
                  </p>
                );
              case INACTIVE:
                return (
                  <p style={{ color: "red" }}>
                    {t("fridge.messages.socialFridgeInactive")}
                  </p>
                );
              default:
                return null;
            }
          })()}
        </div>
      )}

      {socialFridge &&
        (currentRole === CLIENT_USER || currentRole === CLIENT_MANAGER) && (
          <div>
            <Image
              src={smallerIconUrl}
              alt="Service Fridge"
              layout="fixed"
              className={styles["image-service-fridge"]}
              ref={anchorRef}
              aria-controls={open ? "fridge-menu" : undefined}
              aria-expanded={open ? "true" : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
            />
            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal
              placement="bottom-end"
            >
              {({ TransitionProps, placement }) => (
                <Grow
                  {...TransitionProps}
                  style={{
                    transformOrigin:
                      placement === "bottom-start" ? "left top" : "left bottom",
                  }}
                >
                  <Paper>
                    <ClickAwayListener onClickAway={() => setOpen(false)}>
                      <MenuList
                        autoFocusItem={open}
                        id="fridge-menu"
                        onKeyDown={handleListKeyDown}
                      >
                        {currentRole === CLIENT_MANAGER &&
                          socialFridge.state !== ARCHIVED && (
                            <MenuItem
                              onClick={() => handleConfirmStateChange(ARCHIVED)}
                            >
                              {t("fridge.actions.archive")}
                            </MenuItem>
                          )}

                        {currentRole === CLIENT_MANAGER &&
                          socialFridge.state !== ACTIVE && (
                            <MenuItem
                              onClick={() => handleConfirmStateChange(ACTIVE)}
                            >
                              {t("fridge.actions.activate")}
                            </MenuItem>
                          )}

                        {currentRole === CLIENT_MANAGER &&
                          socialFridge.state !== INACTIVE && (
                            <MenuItem
                              onClick={() => handleConfirmStateChange(INACTIVE)}
                            >
                              {t("fridge.actions.deactivate")}
                            </MenuItem>
                          )}

                        {currentRole === CLIENT_USER &&
                          socialFridge.state !== ARCHIVED && (
                            <MenuItem onClick={() => setOpenDialog(true)}>
                              {t("fridge.actions.newSuggestion")}
                            </MenuItem>
                          )}
                        {currentRole === CLIENT_USER &&
                          socialFridge.state === ACTIVE && (
                            <MenuItem
                              onClick={() =>
                                setCurrentDialog(DialogType.UpdateFridge)
                              }
                            >
                              {t("fridge.messages.update_fridge_title")}
                            </MenuItem>
                          )}
                        {currentRole === CLIENT_MANAGER &&
                          socialFridge.state !== ARCHIVED && (
                            <MenuItem onClick={handleEditFridge}>
                              {t("fridge.messages.edit_fridge_title")}
                            </MenuItem>
                          )}
                      </MenuList>
                    </ClickAwayListener>
                  </Paper>
                </Grow>
              )}
            </Popper>
            <ConfirmationDialog
              isOpen={confirmationDialogOpen}
              onClose={handleCloseConfirmationDialog}
              onConfirm={handleConfirmationConfirm}
              message={t("fridge.confirm_actions.confirm_action", {
                action: getMessageAction(),
              })}
              t={t}
            />
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
              <DialogTitle>{t("fridge.actions.newSuggestion")}</DialogTitle>
              <DialogContent>
                <form onSubmit={newSuggestion}>
                  <Grid marginTop={2}>
                    <Controller
                      name="image"
                      control={control}
                      render={({ field }) => (
                        <FileInput field={field} inputProps={{}} t={t} />
                      )}
                    />
                  </Grid>

                  <Grid
                    container
                    justifyContent="center"
                    alignItems="center"
                    marginTop={2}
                  >
                    <Controller
                      name="description"
                      control={control}
                      rules={validationRules.description}
                      render={({ field, fieldState }) => (
                        <TextField
                          label={t("fridge.details.description")}
                          InputLabelProps={{
                            style: { color: secondary },
                          }}
                          multiline
                          rows={4}
                          {...field}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error ? fieldState.error.message : ""
                          }
                        />
                      )}
                    />
                  </Grid>
                  <Button
                    onClick={() => setOpenDialog(false)}
                    style={{ color: secondary }}
                  >
                    {t("confirmationDialog.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    onClick={handleSubmit(newSuggestion)}
                    style={{ color: secondary }}
                  >
                    {t("confirmationDialog.confirm")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      {(currentRole === CLIENT_MANAGER || currentRole === CLIENT_USER) &&
        socialFridge &&
        socialFridge.state === ACTIVE && (
          <div
            style={{
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              style={{
                color: secondary,
                background: primary,
                borderColor: secondary,
                border: "1px solid",
              }}
              className={styles["newProduct"]}
              size="small"
              onClick={() => setCurrentDialog(DialogType.AddProduct)}
            >
              {t("fridge.actions.newProduct")}
            </Button>
          </div>
        )}
      <AddProduct
        onProductAdded={handleProductAdded}
        socialFridgeId={Number(fridgeId)}
        isOpen={currentDialog === DialogType.AddProduct}
        onClose={() => setCurrentDialog(DialogType.None)}
        t={t}
        userLocation={userLocation}
      />
      {socialFridge && (
        <UpdateFridge
          socialFridge={socialFridge}
          isOpen={currentDialog === DialogType.UpdateFridge}
          onClose={() => setCurrentDialog(DialogType.None)}
          t={t}
          userLocation={userLocation}
        />
      )}
      {socialFridge && (
        <EditFridge
          isOpen={currentDialog === DialogType.EditFridge}
          onClose={() => setCurrentDialog(DialogType.None)}
          t={t}
          userLocation={userLocation}
          managers={managers}
          socialFridge={socialFridge}
          socialFridgeETag={socialFridgeETag}
          addressETag={addreessETag}
          handleEditManager={handleEditManager}
          handleEditAddress={handleEditAddress}
        />
      )}
    </div>
  );
}

export default Fridge;
