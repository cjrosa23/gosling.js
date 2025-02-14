import { goslingToHiGlass } from './gosling-to-higlass';
import { SingleTrack } from './gosling.schema';
import { HiGlassModel } from './higlass-model';
import { EX_TRACK_SEMANTIC_ZOOM } from '../editor/example/semantic-zoom';
import { convertToFlatTracks } from './utils/spec-preprocess';

describe('Should convert gosling spec to higlass view config.', () => {
    it('Should return a generated higlass view config correctly', () => {
        const model = new HiGlassModel();
        const higlass = goslingToHiGlass(
            model,
            convertToFlatTracks(EX_TRACK_SEMANTIC_ZOOM.cytoband)[0],
            {
                width: 1000,
                height: 100,
                x: 10,
                y: 10
            },
            {
                x: 0,
                y: 0,
                w: 12,
                h: 12
            }
        ).spec();
        expect(Object.keys(higlass)).not.toHaveLength(0);
    });
    it('Should not generate a higlass view config when not supported', () => {
        const model = new HiGlassModel();
        const higlass = goslingToHiGlass(
            model,
            {
                // no spec
            } as SingleTrack,
            {
                width: 1000,
                height: 100,
                x: 10,
                y: 10
            },
            {
                x: 0,
                y: 0,
                w: 12,
                h: 12
            }
        ).spec();
        expect(higlass.views).toHaveLength(0);
    });
});
