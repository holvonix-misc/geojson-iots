// tslint:disable:variable-name
import * as io from 'io-ts';
import { nonEmptyArray } from 'io-ts-types/lib/nonEmptyArray';

export const i = io.interface;
export const u = io.union;
export const l = io.literal;
export const a = io.array;
export const nea = nonEmptyArray;
export const t = io.tuple;
export const p = io.partial;

/**
 * https://tools.ietf.org/html/rfc7946#section-1.4
 */
export const DirectGeometryTypeIO = u([
    l('Point'),
    l('Polygon'),
    l('LineString'),
    l('MultiPoint'),
    l('MultiPolygon'),
    l('MultiLineString'),
], 'DirectGeometryTypeIO');

export const GeometryCollectionTypeIO = l('GeometryCollection', 'GeometryCollectionTypeIO');

export const GeometryTypeIO = u([
    DirectGeometryTypeIO,
    GeometryCollectionTypeIO,
], 'GeometryTypeIO');

export const GeoJsonTypeIO = u([
    GeometryTypeIO,
    u([
        l('Feature'),
        l('FeatureCollection'),
    ]),
], 'GeoJsonTypeIO');

/**
 * https://tools.ietf.org/html/rfc7946#section-5
 * 
 * This should really be either 4- or 8-tuple of numbers.
 * But io-ts doesn't support that.
 */
export const BoundingBoxIO = a(io.number, 'BoundingBoxIO');


/***
* https://tools.ietf.org/html/rfc7946#section-3
*/
export const GeoJsonObjectIO = io.intersection([
    i({
        type: GeoJsonTypeIO,
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'GeoJsonObjectIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.1
* however we accept only 2 coordinates.
*/
export const PositionIO = t([io.number,io.number], 'PositionIO');

export const CoordinatesIO = u([
    PositionIO,
    a(PositionIO),
    a(a(PositionIO)),
    a(a(a(PositionIO))),
], 'CoordinatesIO');


/***
* https://tools.ietf.org/html/rfc7946#section-3.1.2
*/
export const PointIO = io.intersection([
    i({
        type: l('Point'),
        coordinates: PositionIO,
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'PointIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.3
*/
export const MultiPointIO = io.intersection([
    i({
        type: l('MultiPoint'),
        coordinates: a(PositionIO),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'MultiPointIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.4
*/
export const LineStringIO = io.intersection([
    i({
        type: l('LineString'),
        coordinates: a(PositionIO),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'LineStringIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.5
*/
export const MultiLineStringIO = io.intersection([
    i({
        type: l('MultiLineString'),
        coordinates: a(nea(PositionIO)),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'MultiLineStringIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.6
*/
export const PolygonIO = io.intersection([
    i({
        type: l('Polygon'),
        coordinates: nea(nea(PositionIO)),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'PolygonIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.7
*/
export const MultiPolygonIO = io.intersection([
    i({
        type: l('MultiPolygon'),
        coordinates: a(nea(nea(PositionIO))),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'MultiPolygonIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1
*/
export const DirectGeometryObjectIO = io.union([
    PointIO, MultiPointIO, LineStringIO, MultiLineStringIO, PolygonIO, MultiPolygonIO,
], 'DirectGeometryObjectIO');

/***
* https://tools.ietf.org/html/rfc7946#section-3.1.8
* 
* Because of difficulty to express nested types here and the RFC states that:
* "To maximize interoperability, implementations SHOULD avoid nested
   GeometryCollections"
* We do not implement nested collections.
*/
export const GeometryCollectionIO = io.intersection([
    i({
        type: l('GeometryCollection'),
        geometries: a(DirectGeometryObjectIO),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
]);


export const GeometryObjectIO = u([
    DirectGeometryObjectIO,
    GeometryCollectionIO,
], 'GeometryObjectIO');


/***
* https://tools.ietf.org/html/rfc7946#section-3.2
*/
export const PropertiesIO = u([io.dictionary(io.string, io.any), io.null], 'PropertiesIO');

export const FeatureIO = io.intersection([
    i({
        type: l('Feature'),
        geometry: u([GeometryObjectIO, io.null]),
        properties: PropertiesIO,
    }),
    p({
        id: u([io.string, io.number]),
        bbox: BoundingBoxIO,
    }),
], 'FeatureIO');

export const PartialFeatureIO =
    <T>(propType: io.Type<T>, name: string) => io.intersection([
        i({
            type: l('Feature'),
            geometry: u([GeometryObjectIO, io.null]),
            properties: propType,
        }),
        p({
            id: u([io.string, io.number]),
            bbox: BoundingBoxIO,
        }),
    ], name);

/***
* https://tools.ietf.org/html/rfc7946#section-3.3
*/
export const FeatureCollectionIO = io.intersection([
    i({
        type: l('FeatureCollection'),
        features: a(FeatureIO),
    }),
    p({
        bbox: BoundingBoxIO,
    }),
], 'FeatureCollectionIO');



export type DirecGeometryType = io.TypeOf<typeof DirectGeometryTypeIO>;
export type GeometryType = io.TypeOf<typeof GeometryTypeIO>;
export type GeoJsonType = io.TypeOf<typeof GeoJsonTypeIO>;
export type GeoJsonObject = io.TypeOf<typeof GeoJsonObjectIO>;
export type Position = io.TypeOf<typeof PositionIO>;
export type DirectGeometryObject = io.TypeOf<typeof DirectGeometryObjectIO>;
export type GeometryObject = io.TypeOf<typeof GeometryObjectIO>;
export type Point = io.TypeOf<typeof PointIO>;
export type MultiPoint = io.TypeOf<typeof MultiPointIO>;
export type LineString = io.TypeOf<typeof LineStringIO>;
export type MultiLineString = io.TypeOf<typeof MultiLineStringIO>;
export type Polygon = io.TypeOf<typeof PolygonIO>;
export type MultiPolygon = io.TypeOf<typeof MultiPolygonIO>;
export type Feature = io.TypeOf<typeof FeatureIO>;
export type FeatureCollection = io.TypeOf<typeof FeatureCollectionIO>;
export type Properties = io.TypeOf<typeof PropertiesIO>;

