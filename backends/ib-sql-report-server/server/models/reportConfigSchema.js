const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const timestamps = require('mongoose-timestamp');

const { Schema } = mongoose;

const sumItemSchema = new Schema({
    query: { type: String, required: true },
    dataRow: { type: Number, required: true },
    dataColumn: { type: Number, required: true }
}, { _id: false });

const reportConfigSchema = new Schema({
    category: { type: String, required: true, index: true },
    name: { type: String, required: true, unique: true, index: true },
    tableName: { type: String, required: true },
    templateName: { type: String, required: true },
    columns: { type: String, default: "" },
    connectionString: { type: String, required: true },
    query: { type: String, required: true },
    maxRowPerPage: { type: Number, default: 0 },
    maxAvailableRowPerPage: { type: Number, default: 0 },
    sumStartColumnNumber: { type: Number, default: 0 },
    maxSumStartColumnNumber: { type: Number, default: 0 },
    reportHeaderBlankRowCount: { type: Number, default: 0 },
    reportHeaderStartRowNo: { type: Number, default: 0 },
    reportHeaderRowCount: { type: Number, default: 0 },
    tableHeaderStartRowNo: { type: Number, default: 0 },
    tableHeaderRowCount: { type: Number, default: 0 },
    reportDateRow: { type: Number, default: 0 },
    reportDateColumn: { type: Number, default: 0 },
    fromDateRow: { type: Number, default: 0 },
    fromDateColumn: { type: Number, default: 0 },
    toDateRow: { type: Number, default: 0 },
    toDateColumn: { type: Number, default: 0 },
    footerRowCount: { type: Number, default: 0 },
    isGraphSupported: { type: Boolean, default: false },
    isTabularSupported: { type: Boolean, default: false },
    sum: [sumItemSchema]
}, {
    collection: 'reportConfigs',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

reportConfigSchema.plugin(mongoosePaginate);
reportConfigSchema.plugin(timestamps);

reportConfigSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

const reportSettingsSchema = new Schema({
    exportFolder: { type: String, default: "" },
    connections: {
        ConnectionString: { type: String, default: "" },
        ConnectionString1: { type: String, default: "" },
        ConnectionString2: { type: String, default: "" },
        AlarmReportConnectionString: { type: String, default: "" }
    }
}, {
    collection: 'reportSettings',
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
});

reportSettingsSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    delete obj.__v;
    return obj;
};

module.exports = {
    ReportConfig: mongoose.model('ReportConfig', reportConfigSchema),
    ReportSettings: mongoose.model('ReportSettings', reportSettingsSchema)
};
