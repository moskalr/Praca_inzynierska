import DeliveryDiningIcon from "@mui/icons-material/DeliveryDining";
import HandshakeIcon from "@mui/icons-material/Handshake";
import RestaurantIcon from "@mui/icons-material/Restaurant";

import { Tab, Tabs, useMediaQuery, useTheme } from "@mui/material";
import Cookies from "js-cookie";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import React, { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserContext } from "../../components/context/UserContextProvider";
import AddProduct from "../../components/foodExchange/AddProduct";
import TabPanel from "../../components/foodExchange/TabPanel";
import AllDeliveryToUserList from "../../components/foodExchange/allDeliveriesToUser/AllDeliveriesToUser";
import AllExchangeList from "../../components/foodExchange/allExchages/AllExchangesList";
import AllProductList from "../../components/foodExchange/allProducts/AllProductList";
import ExchangeList from "../../components/foodExchange/exchanges/ExchangeList";
import OwnDeliveryToUserList from "../../components/foodExchange/ownDeliveries/OwnDeliveryToUserList";
import ProductList from "../../components/foodExchange/ownProducts/ProductList";
import { foodExchangeDictionary } from "../../constants/dictionary";
import {
  CLIENT_ADMIN,
  CLIENT_MANAGER,
  CLIENT_MODERATOR,
  CLIENT_USER,
  CLIENT_VOLUNTEER,
} from "../../constants/roles";
import { TOKEN } from "../../constants/variables";
import { Product } from "../../type/mzwz";

const translation = "Tabs.TabsTitle.";

export function FoodExchange() {
  const [products, setProducts] = useState<Product[]>([]);
  const [tabValue, setTabValue] = useState(1);
  const [hydrated, setHydrated] = useState(false);
  const { t } = useTranslation(foodExchangeDictionary);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { currentRole } = useContext(UserContext);
  const { usernameAccount } = useContext(UserContext);
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };
  const exchangesPermission = [CLIENT_MODERATOR, CLIENT_ADMIN];
  const deliveriesPermission = [
    CLIENT_MODERATOR,
    CLIENT_ADMIN,
    CLIENT_VOLUNTEER,
  ];

  const token = Cookies.get(TOKEN);
  useEffect(() => {
    setHydrated(true);
  }, []);
  if (!hydrated) {
    return null;
  }
  return (
    <>
      <Tabs
        variant={isMobile ? "scrollable" : "fullWidth"}
        value={tabValue}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="secondary"
        sx={{
          position: "sticky",
          top: 75,
          zIndex: 1001,
          bgcolor: "white",
          boxShadow: 2,
        }}
      >
        {token && currentRole == CLIENT_USER && (
          <Tab
            icon={<RestaurantIcon />}
            label={t(translation + "ownProducts")}
            value={0}
          />
        )}
        <Tab
          icon={<RestaurantIcon />}
          label={t(translation + "allProducts")}
          value={1}
        />
        {token && currentRole == CLIENT_USER && (
          <Tab
            icon={<HandshakeIcon />}
            label={t(translation + "ownExchanges")}
            value={2}
          />
        )}
        {token && exchangesPermission.includes(currentRole) && (
          <Tab
            icon={<HandshakeIcon />}
            label={t(translation + "allExchanges")}
            value={3}
          />
        )}
        {token && currentRole == CLIENT_VOLUNTEER && (
          <Tab
            icon={<DeliveryDiningIcon />}
            label={t(translation + "ownDeliveries")}
            value={4}
          />
        )}
        {token && deliveriesPermission.includes(currentRole) && (
          <Tab
            icon={<DeliveryDiningIcon />}
            label={t(translation + "allDeliveries")}
            value={5}
          />
        )}
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <ProductList />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AllProductList />
        <AddProduct />
      </TabPanel>
      <TabPanel value={tabValue} index={2}>
        <ExchangeList />
      </TabPanel>
      <TabPanel value={tabValue} index={3}>
        <AllExchangeList />
      </TabPanel>
      <TabPanel value={tabValue} index={4}>
        <OwnDeliveryToUserList />
      </TabPanel>
      <TabPanel value={tabValue} index={5}>
        <AllDeliveryToUserList />
      </TabPanel>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        foodExchangeDictionary,
        "navbar",
      ])),
    },
  };
}

export default FoodExchange;
