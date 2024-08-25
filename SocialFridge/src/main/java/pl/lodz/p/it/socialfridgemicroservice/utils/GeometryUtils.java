package pl.lodz.p.it.socialfridgemicroservice.utils;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

public class GeometryUtils {
    public static Point createPoint(String latitude, String longitude) {
        return new GeometryFactory().createPoint(new Coordinate(Double.parseDouble(longitude), Double.parseDouble(latitude)));
    }
}