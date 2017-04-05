describe('application entry', function () {
    var mode, version;

    beforeEach(module('nb'));
    beforeEach(inject(function (_mode_, _version_) {
        mode = _mode_;
        version = _version_;
    }));

    it('application mode correct', function () {
        expect(mode).toEqual('app');
    });

    it('application version correct', function () {
        expect(version).toEqual('0.1.1');
    });
});