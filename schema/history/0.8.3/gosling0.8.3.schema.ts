import { Chromosome } from './utils/chrom-size';
import { Theme } from './utils/theme';

/* ----------------------------- ROOT SPEC ----------------------------- */
export type GoslingSpec = RootSpecWithSingleView | RootSpecWithMultipleViews;

export type RootSpecWithSingleView = SingleView & {
    title?: string;
    subtitle?: string;
    description?: string;
    theme?: Theme;
};

export interface RootSpecWithMultipleViews extends MultipleViews {
    title?: string;
    subtitle?: string;
    description?: string;
    theme?: Theme;
}

/* ----------------------------- VIEW ----------------------------- */
export type View = SingleView | MultipleViews;

export type SingleView = OverlaidTracks | StackedTracks | FlatTracks;

export interface FlatTracks extends CommonViewDef {
    tracks: Track[];
}

export interface StackedTracks extends CommonViewDef, Partial<SingleTrack> {
    alignment?: 'stack';
    tracks: (Partial<Track> | OverlaidTracks)[];
}

export interface OverlaidTracks extends CommonViewDef, Partial<SingleTrack> {
    alignment: 'overlay';
    tracks: Partial<Track>[];
    width: number;
    height: number;
}

export interface MultipleViews extends CommonViewDef {
    arrangement?: 'parallel' | 'serial' | 'horizontal' | 'vertical';
    views: Array<SingleView | MultipleViews>;
}

export type Layout = 'linear' | 'circular';
export type Orientation = 'horizontal' | 'vertical';
export type Assembly = 'hg38' | 'hg19' | 'hg18' | 'hg17' | 'hg16' | 'mm10' | 'mm9' | 'unknown';

export interface CommonViewDef {
    layout?: Layout;
    orientation?: Orientation;

    spacing?: number;
    static?: boolean;

    assembly?: Assembly;

    // TODO: Change to domain?
    xDomain?: DomainInterval | DomainChrInterval | DomainChr;
    linkingId?: string;
    xAxis?: AxisPosition; // not supported currently

    /**
     * Proportion of the radius of the center white space.
     */
    centerRadius?: number; // [0, 1] (default: 0.3)

    // Overriden by children
    style?: Style;
}

/* ----------------------------- TRACK ----------------------------- */
export type Track = SingleTrack | OverlaidTrack | DataTrack;

export interface CommonRequiredTrackDef {
    width: number;
    height: number;
}

export interface CommonTrackDef extends CommonViewDef, CommonRequiredTrackDef {
    id?: string; // Assigned to `uid` in a HiGlass view config, used for API
    title?: string; // Shows textual label on the left-top corner of a track
    subtitle?: string; // Being used only for a title track (i.e., 'text-track')

    // Arrangement
    overlayOnPreviousTrack?: boolean;

    // Circular Layout
    outerRadius?: number;
    innerRadius?: number;
    startAngle?: number; // [0, 360]
    endAngle?: number; // [0, 360]

    // Internally used properties for rendering
    _renderingId?: string;

    // To test upcoming feature.
    prerelease?: { testUsingNewRectRenderingForBAM?: boolean };
}

/**
 * Partial specification of `BasicSingleTrack` to use default visual encoding predefined by data type.
 */
export interface DataTrack extends CommonTrackDef {
    data: DataDeep;
}

/* ----------------------------- MARK ----------------------------- */
export type Mark = MarkType | MarkDeep;

export type MarkType =
    | 'point'
    | 'line'
    | 'area'
    | 'bar'
    | 'rect'
    | 'text'
    | 'link'
    | 'between-link'
    | 'rule'
    | 'triangleLeft'
    | 'triangleRight'
    | 'triangleBottom'
    // experimental
    | 'brush'
    // TODO: perhaps need to make this invisible to users
    // being used to show title/subtitle internally
    | 'header';

/* ----------------------------- TRACK ----------------------------- */
export interface SingleTrack extends CommonTrackDef {
    // Data
    data: DataDeep;

    // Data transformation
    dataTransform?: DataTransform[];

    tooltip?: Tooltip[];

    // Mark
    mark: Mark;

    // Visual channels
    x?: Channel; // We could have a special type of Channel for axes
    y?: Channel;
    xe?: Channel;
    ye?: Channel;

    x1?: Channel;
    y1?: Channel;
    x1e?: Channel;
    y1e?: Channel;

    row?: Channel;
    column?: Channel;

    color?: Channel;
    size?: Channel;
    text?: Channel;

    stroke?: Channel;
    strokeWidth?: Channel;
    opacity?: Channel;

    // Resolving overlaps
    displacement?: Displacement;

    // Visibility
    visibility?: VisibilityCondition[];

    // Experimental
    flipY?: boolean; // This is only supported for `link` marks.
    stretch?: boolean; // Stretch the size to the given range? (e.g., [x, xe])
    overrideTemplate?: boolean; // Override a spec template that is defined for a given data type.
}

export interface Tooltip {
    field: string;
    type: FieldType;
    alt?: string;
    format?: string;
}

export interface Displacement {
    type: DisplacementType;
    padding?: number; // A pixel value

    // "pile" specific parameters (TODO: make this a separate interface)
    // minRows?: number; // Specify at least how many rows should be generated (default: 0)
    // maxRows?: number; // Specify maximum rows to be generated (default: `undefined` meaning no limit)
}

export type DisplacementType = 'pile' | 'spread';

// TODO: Check whether `Omit` is properly included in the generated `gosling.schema.json`
// https://github.com/vega/ts-json-schema-generator/issues/101
/**
 * Superposing multiple tracks.
 */
export type OverlaidTrack = Partial<SingleTrack> &
    CommonRequiredTrackDef & {
        overlay: Partial<Omit<SingleTrack, 'height' | 'width' | 'layout' | 'title' | 'subtitle'>>[];
    };

export interface Style {
    // Top-level Styles
    background?: string;
    backgroundOpacity?: number;
    outline?: string;
    outlineWidth?: number;

    // Mark-level styles
    dashed?: [number, number];
    linePattern?: { type: 'triangleLeft' | 'triangleRight'; size: number };
    curve?: 'top' | 'bottom' | 'left' | 'right'; // for genomic range rules
    align?: 'left' | 'right'; // currently, only supported for triangles
    dy?: number; // currently, only used for text marks
    bazierLink?: boolean; // use bazier curves instead
    circularLink?: boolean; // !! Deprecated: draw arc instead of bazier curve?
    inlineLegend?: boolean; // show legend in a single horizontal line?
    // below options could instead be used with channel options (e.g., size, stroke, strokeWidth)
    textFontSize?: number;
    textStroke?: string;
    textStrokeWidth?: number;
    textFontWeight?: 'bold' | 'normal';
    textAnchor?: 'start' | 'middle' | 'end';
}

/* ----------------------------- SEMANTIC ZOOM ----------------------------- */
export type VisibilityCondition = SizeVisibilityCondition | ZoomLevelVisibilityCondition;

interface CommonVisibilityCondition {
    operation: LogicalOperation;
    conditionPadding?: number;
    transitionPadding?: number;
}

export interface SizeVisibilityCondition extends CommonVisibilityCondition {
    target: 'track' | 'mark';
    measure: 'width' | 'height';
    threshold: number | '|xe-x|';
}

export interface ZoomLevelVisibilityCondition extends CommonVisibilityCondition {
    target: 'track' | 'mark';
    measure: 'zoomLevel';
    threshold: number;
}

export type LogicalOperation =
    | 'less-than'
    | 'lt'
    | 'LT'
    | 'greater-than'
    | 'gt'
    | 'GT'
    | 'less-than-or-equal-to'
    | 'ltet'
    | 'LTET'
    | 'greater-than-or-equal-to'
    | 'gtet'
    | 'GTET';

/* ----------------------------- VISUAL CHANNEL ----------------------------- */
export const ChannelTypes = {
    // coordinates
    x: 'x',
    y: 'y',
    xe: 'xe',
    ye: 'ye',
    // coordinates for link
    x1: 'x1',
    y1: 'y1',
    x1e: 'x1e',
    y1e: 'y1e',
    // others
    color: 'color',
    row: 'row',
    opacity: 'opacity',
    stroke: 'stroke',
    strokeWidth: 'strokeWidth',
    size: 'size',
    text: 'text'
} as const;

export type ChannelType = keyof typeof ChannelTypes | string;

export type Channel = ChannelDeep | ChannelValue; // TODO: support null to allow removing spec when overriding

export interface ChannelDeep {
    field?: string;
    type?: FieldType;
    aggregate?: Aggregate;
    domain?: Domain;
    range?: Range;
    axis?: AxisPosition;
    legend?: boolean;
    baseline?: string | number;
    zeroBaseline?: boolean; // We could remove this and use the `baseline` option instead
    mirrored?: boolean; // Show baseline on the top or right instead of bottom or left
    grid?: boolean;
    linkingId?: string;
    flip?: boolean; // Flip a track vertically or horizontally?
    stack?: boolean; // Experimental: We could use this option to stack visual marks, addressing the visual overlap (e.g., stacked bar).
    padding?: number; // Experimental: Used in `row` and `column` for vertical and horizontal padding.
    sort?: string[]; // Experimental: Fix order by categories (e.g., stacked bars).
}

export interface ChannelValue {
    value: number | string;
}

export type AxisPosition = 'none' | 'top' | 'bottom' | 'left' | 'right';
export type FieldType = 'genomic' | 'nominal' | 'quantitative';
export type Domain = string[] | number[] | DomainInterval | DomainChrInterval | DomainChr | DomainGene;
export type Range = string[] | number[] | PREDEFINED_COLORS;
export type PREDEFINED_COLORS = 'viridis' | 'grey' | 'spectral' | 'warm' | 'cividis' | 'bupu' | 'rdbu';

export interface DomainChr {
    // For showing a certain chromosome
    chromosome: Chromosome;
}
export interface DomainChrInterval {
    // For showing a certain interval in a chromosome
    chromosome: Chromosome;
    interval: [number, number];
}
export interface DomainInterval {
    // For showing a certain interval in intire chromosomes
    interval: [number, number]; // This is consistent to HiGlass's initXDomain and initYDomain.
}
export interface DomainGene {
    // For showing genes
    // TODO: Not supported yet
    gene: string | [string, string];
}

export type Aggregate = 'max' | 'min' | 'mean' | 'bin' | 'count';

/* ----------------------------- DATA ----------------------------- */
export type DataDeep = JSONData | CSVData | BIGWIGData | MultivecData | BEDDBData | VectorData | MatrixData | BAMData;

export interface Datum {
    [k: string]: number | string;
}

export interface JSONData {
    type: 'json';
    values: Datum[];
    quantitativeFields?: string[];
    chromosomeField?: string;
    genomicFields?: string[];
    sampleLength?: number; // This limit the total number of rows fetched (default: 1000)

    // !!! experimental
    genomicFieldsToConvert?: {
        chromosomeField: string;
        genomicFields: string[];
    }[];
}

export interface CSVData {
    type: 'csv';
    url: string;
    separator?: string;
    quantitativeFields?: string[];
    chromosomeField?: string;
    genomicFields?: string[];
    sampleLength?: number; // This limit the total number of rows fetched (default: 1000)

    // !!! below is experimental
    headerNames?: string[];
    chromosomePrefix?: string;
    longToWideId?: string;
    genomicFieldsToConvert?: {
        chromosomeField: string;
        genomicFields: string[];
    }[];
}

export interface MultivecData {
    type: 'multivec';
    url: string;
    column: string;
    row: string;
    value: string;
    categories?: string[];
    start?: string;
    end?: string;
    binSize?: number; // Binning the genomic interval in tiles (unit size: 256)
}

export interface BIGWIGData {
    type: 'bigwig';
    url: string;
    column: string;
    value: string;
    start?: string;
    end?: string;
    binSize?: number; // Binning the genomic interval in tiles (unit size: 256)
}

export interface VectorData {
    type: 'vector';
    url: string;
    column: string;
    value: string;
    start?: string;
    end?: string;
    binSize?: number; // Binning the genomic interval in tiles (unit size: 256)
}

export interface BEDDBData {
    type: 'beddb';
    url: string;
    genomicFields: { index: number; name: string }[];
    valueFields?: { index: number; name: string; type: 'nominal' | 'quantitative' }[];
    // this is a somewhat arbitrary option for reading gene annotation datasets
    // should be multi-value fields (e.g., "1,2,3")
    exonIntervalFields?: [{ index: number; name: string }, { index: number; name: string }];
}

export interface BAMData {
    type: 'bam';
    url: string;
}

/* ----------------------------- DATA TRANSFORM ----------------------------- */
export interface MatrixData {
    type: 'matrix';
    url: string;
}

export type DataTransform =
    | FilterTransform
    | StrConcatTransform
    | StrReplaceTransform
    | LogTransform
    | DisplaceTransform
    | ExonSplitTransform
    | CoverageTransform
    | JSONParseTransform;

export type FilterTransform = OneOfFilter | RangeFilter | IncludeFilter;

export interface RangeFilter {
    type: 'filter';
    field: string;
    inRange: number[];
    not?: boolean;
}

export interface IncludeFilter {
    type: 'filter';
    field: string;
    include: string;
    not?: boolean;
}

export interface OneOfFilter {
    type: 'filter';
    field: string;
    oneOf: string[] | number[];
    not?: boolean;
}

export type LogBase = number | 'e';
export interface LogTransform {
    type: 'log';
    field: string;
    base?: LogBase; // If not specified, 10 is used
    newField?: string; // If specified, store transformed values in a new field.
}

export interface StrConcatTransform {
    type: 'concat';
    fields: string[];
    newField: string;
    separator: string;
}

export interface StrReplaceTransform {
    type: 'replace';
    field: string;
    newField: string;
    replace: { from: string; to: string }[];
}

export interface DisplaceTransform {
    type: 'displace';
    // We could support different types of bounding boxes (e.g., using a center position and a size)
    boundingBox: {
        startField: string; // The name of a quantitative field that represents the start position
        endField: string; // The name of a quantitative field that represents the end position
        padding?: number; // The padding around visual lements. Either px or bp
        isPaddingBP?: boolean; // whether to consider `padding` as the bp length.
        groupField?: string; // The name of a nominal field to group rows by in prior to piling-up
    };
    method: DisplacementType;
    newField: string;

    // "pile" specific parameters (TODO: make this a separate interface)
    maxRows?: number; // Specify maximum rows to be generated (default: `undefined` meaning no limit)
}

export interface ExonSplitTransform {
    type: 'exonSplit';
    separator: string;
    flag: { field: string; value: number | string };
    fields: { field: string; type: FieldType; newField: string; chrField: string }[];
}

/**
 * Aggregate rows and calculate coverage
 */
export interface CoverageTransform {
    type: 'coverage';
    startField: string;
    endField: string;
    newField?: string;
    groupField?: string; // The name of a nominal field to group rows by in prior to piling-up
}

/**
 * Parse JSON Object Array and append vertically
 */
export interface JSONParseTransform {
    type: 'subjson';
    field: string; // The field that contains the JSON object array
    baseGenomicField: string; // Base genomic position when parsing relative position
    genomicField: string; // Relative genomic position to parse
    genomicLengthField: string; // Length of genomic interval
}

/* ----------------------------- GLYPH (deprecated, but to be supported again) ----------------------------- */
export type MarkDeep = MarkGlyphPreset | MarkGlyph | MarkWithStyle;

export interface MarkWithStyle {
    type: MarkType;
    curvature?: 'straight' | 'stepwise' | 'curved';
}

export interface MarkGlyphPreset {
    type: string; //GLYPH_LOCAL_PRESET_TYPE | GLYPH_HIGLASS_PRESET_TYPE;
    server: string; // TODO: Not supported yet
}

export interface MarkGlyph {
    type: 'compositeMark';
    name: string;
    referenceColumn?: string; // reference column for selecting data tuples for each glyph
    requiredChannels: ChannelType[]; // channels that must be assigned // TODO: What about optional channels?
    elements: GlyphElement[];
}

export interface GlyphElement {
    // primitives
    description?: string;
    select?: { channel: ChannelType; oneOf: string[] }[];
    mark: MarkType | MarkBind;
    // coordinates
    x?: ChannelBind | ChannelValue | 'none';
    y?: ChannelBind | ChannelValue | 'none';
    xe?: ChannelBind | ChannelValue | 'none';
    ye?: ChannelBind | ChannelValue | 'none';
    // coordinates for link
    x1?: ChannelBind | ChannelValue | 'none';
    y1?: ChannelBind | ChannelValue | 'none';
    x1e?: ChannelBind | ChannelValue | 'none';
    y1e?: ChannelBind | ChannelValue | 'none';
    // others
    stroke?: ChannelBind | ChannelValue | 'none';
    strokeWidth?: ChannelBind | ChannelValue | 'none';
    row?: ChannelBind | ChannelValue | 'none';
    color?: ChannelBind | ChannelValue | 'none';
    size?: ChannelBind | ChannelValue | 'none';
    w?: ChannelBind | ChannelValue | 'none';
    opacity?: ChannelBind | ChannelValue | 'none';
    text?: ChannelBind | ChannelValue | 'none';
    background?: ChannelBind | ChannelValue | 'none';
    style?: MarkStyleInGlyph;
}

export interface MarkStyleInGlyph {
    dashed?: string;
    dy?: number;
    stroke?: string;
    strokeWidth?: number;
    background?: string;
}

export interface MarkBind {
    bind: string;
    domain: string[];
    range: MarkType[];
}

export interface ChannelBind {
    bind: ChannelType;
    aggregate?: Aggregate;
}

export interface AnyGlyphChannels {
    // Allow defining any kinds of chennels for binding data in Glyph
    [key: string]: ChannelBind | ChannelValue;
}
