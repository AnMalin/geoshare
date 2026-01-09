import proj4 from 'proj4';

// Romanian Stereo 70 definition (EPSG:31700 approximation with 7-param transformation for better accuracy)
// Uses Dealul Piscului 1970 datum
const STEREO_70_DEF = "+proj=sterea +lat_0=46 +lon_0=25 +k=0.99975 +x_0=500000 +y_0=500000 +ellps=krass +towgs84=2.329,-147.042,-92.08,0.309,-0.325,-0.497,5.69 +units=m +no_defs";
const WGS_84_DEF = "EPSG:4326";

export interface Stereo70Coordinates {
  x: number; // Easting
  y: number; // Northing
}

export const wgs84ToStereo70 = (lat: number, lng: number): Stereo70Coordinates => {
  try {
    // proj4 takes [longitude, latitude] for conversion
    const [x, y] = proj4(WGS_84_DEF, STEREO_70_DEF, [lng, lat]);
    return { x, y };
  } catch (error) {
    console.error("Projection error:", error);
    return { x: 0, y: 0 };
  }
};