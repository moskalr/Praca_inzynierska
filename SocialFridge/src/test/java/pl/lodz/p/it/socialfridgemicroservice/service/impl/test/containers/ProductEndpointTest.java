package pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers;

import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.HttpStatus;
import com.github.dockerjava.zerodep.shaded.org.apache.hc.core5.http.Method;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddAddress;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddProduct;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.AddSocialFridge;
import pl.lodz.p.it.socialfridgemicroservice.dto.request.DeleteProduct;
import pl.lodz.p.it.socialfridgemicroservice.enums.Category;
import pl.lodz.p.it.socialfridgemicroservice.enums.ProductUnit;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static pl.lodz.p.it.socialfridgemicroservice.service.impl.test.containers.Account.*;

@SpringBootTest
class ProductEndpointTest extends BasicIntegrationConfigTest {
    private static final String BASE_URL = "http://localhost:8091/products";
    private static final String SOCIAL_FRIDGE_URL = "http://localhost:8091/fridges";
    Random random = new Random();
    private final String latitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
    private final String longitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());


    @Test
    void getAllProducts() {
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void getProduct() {
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/-1", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
    }

    @Test
    void getProductNotFoundException() {
        final Response response = sendRequestAndGetResponse(Method.GET, BASE_URL + "/-100", null, ContentType.JSON);
        assertEquals(HttpStatus.SC_NOT_FOUND, response.getStatusCode());
    }

    @Test
    void addProduct() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
    }

    @Test
    void addProductPiecesException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(1L);
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(0);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductDateException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(1L);
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().minusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductSocialFridgeIdException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductSocialFridgeIdNotFountException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(-1000L);
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_NOT_FOUND, response2.getStatusCode());
    }

    @Test
    void addProductProductUnitException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(-1000L);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductDescriptionException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(-1000L);
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductSizeException() {
        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(-1000L);
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(latitude);
        addProduct.setLongitude(longitude);
        addProduct.setPieces(1);
        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductAddressException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        sendLoginRequestAndGetResponse(USER, PASSWORD);
        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(newLatitude);
        addProduct.setLongitude(newLongitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response2.getStatusCode());
    }

    @Test
    void addProductByManager() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(newLatitude);
        addProduct.setLongitude(newLongitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());
    }

    @Test
    void archiveProductByManager() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(newLatitude);
        addProduct.setLongitude(newLongitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final List<Map<String, Object>> productsList = response2.jsonPath().getList("");
        final Integer productId = (Integer) productsList.get(0).get("id");


        final DeleteProduct deleteProduct = new DeleteProduct();
        deleteProduct.setId(Long.valueOf(productId));
        deleteProduct.setLongitude(newLongitude);
        deleteProduct.setLatitude(newLatitude);

        final Response response4 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + productId, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response4.getStatusCode());

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, deleteProduct, ContentType.JSON);
        final String state = response3.jsonPath().get("state");
        assertEquals(HttpStatus.SC_OK, response3.getStatusCode());
        assertEquals("ARCHIVED_BY_USER", state);
    }

    @Test
    void archiveProductByManagerETagException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(newLatitude);
        addProduct.setLongitude(newLongitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final List<Map<String, Object>> productsList = response2.jsonPath().getList("");
        final Integer productId = (Integer) productsList.get(0).get("id");

        final DeleteProduct deleteProduct = new DeleteProduct();
        deleteProduct.setId(Long.valueOf(productId));
        deleteProduct.setLongitude(newLongitude);
        deleteProduct.setLatitude(newLatitude);

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, deleteProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_PRECONDITION_FAILED, response3.getStatusCode());
    }

    @Test
    void archiveProductByUserAddressException() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(newLatitude);
        addProduct.setLongitude(newLongitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final List<Map<String, Object>> productsList = response2.jsonPath().getList("");
        final Integer productId = (Integer) productsList.get(0).get("id");

        final DeleteProduct deleteProduct = new DeleteProduct();
        deleteProduct.setId(Long.valueOf(productId));
        deleteProduct.setLongitude(newLongitude);
        deleteProduct.setLatitude(newLatitude);

        final Response response4 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + productId, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response4.getStatusCode());

        sendLoginRequestAndGetResponse(USER, PASSWORD);

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, deleteProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_BAD_REQUEST, response3.getStatusCode());
    }

    @Test
    void archiveProductByUser() {
        sendLoginRequestAndGetResponse(MANAGER, PASSWORD);
        final AddAddress addAddress = new AddAddress("Szkolna", "1", "Rudnik nad Sanem", "37-420", latitude, longitude);
        final AddSocialFridge addSocialFridge = new AddSocialFridge();
        addSocialFridge.setAddress(addAddress);
        addSocialFridge.setUsername(MANAGER);
        final Response response = sendRequestAndGetResponse(Method.POST, SOCIAL_FRIDGE_URL, addSocialFridge, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response.getStatusCode());
        final Integer fridgeId = response.jsonPath().get("id");

        final String newLatitude = String.valueOf(-90 + (90 - (-90)) * random.nextDouble());
        final String newLongitude = String.valueOf(-180 + (180 - (-180)) * random.nextDouble());

        final AddProduct addProduct = new AddProduct();
        addProduct.setSocialFridgeId(Long.valueOf(fridgeId));
        addProduct.setProductUnit(ProductUnit.KILOGRAMS);
        addProduct.setDescription("Product test");
        addProduct.setImage("https://images.openfoodfacts.org/images/products/544/900/000/0286/front_en.77.200.jpg");
        addProduct.setExpirationDate(LocalDateTime.now().plusDays(1));
        addProduct.setTitle("Product test");
        addProduct.setSize(1D);
        addProduct.getCategories().add(Category.VEGETABLES);
        addProduct.setLatitude(newLatitude);
        addProduct.setLongitude(newLongitude);
        addProduct.setPieces(1);

        final Response response2 = sendRequestAndGetResponse(Method.POST, BASE_URL, addProduct, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response2.getStatusCode());

        final List<Map<String, Object>> productsList = response2.jsonPath().getList("");
        final Integer productId = (Integer) productsList.get(0).get("id");

        final DeleteProduct deleteProduct = new DeleteProduct();
        deleteProduct.setId(Long.valueOf(productId));
        deleteProduct.setLongitude(longitude);
        deleteProduct.setLatitude(latitude);

        final Response response4 = sendRequestAndGetResponse(Method.GET, BASE_URL + "/" + productId, null, ContentType.JSON);
        assertEquals(HttpStatus.SC_OK, response4.getStatusCode());

        sendLoginRequestAndGetResponse(USER, PASSWORD);

        final Response response3 = sendRequestAndGetResponse(Method.PUT, BASE_URL, deleteProduct, ContentType.JSON);
        final String state = response3.jsonPath().get("state");
        assertEquals(HttpStatus.SC_OK, response3.getStatusCode());
        assertEquals("ARCHIVED_BY_USER", state);
    }
}
