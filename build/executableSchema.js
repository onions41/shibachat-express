"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _loadFiles = require("@graphql-tools/load-files");

var _merge = require("@graphql-tools/merge");

var _schema = require("@graphql-tools/schema");

var _utils = require("@graphql-tools/utils");

var _graphql = require("graphql");

var _verifyAccessToken = _interopRequireDefault(require("./auth/verifyAccessToken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Module imports
// Internal imports
// Get all the files in ./typeDefs and merge them together
const typesArray = (0, _loadFiles.loadFilesSync)(_path.default.join(__dirname, "./typeDefs"), {
  extensions: ["graphql"]
}); // Get all the files in ./resolvers and merge them together

const resolversArray = (0, _loadFiles.loadFilesSync)(_path.default.join(__dirname, "./resolvers"), {
  extensions: ["js"]
}); // Creates the executable schema using typeDefs and resolvers

let schema = (0, _schema.makeExecutableSchema)({
  typeDefs: (0, _merge.mergeTypeDefs)(typesArray),
  resolvers: (0, _merge.mergeResolvers)(resolversArray)
}); // Defining custom directive logic for @requiresAuth

function requiresAuthDirectiveTransformer(schema, directiveName = "requiresAuth") {
  return (0, _utils.mapSchema)(schema, {
    // Reminder: Square brackets are used for computed object property names. (Ie, computed key names)
    [_utils.MapperKind.OBJECT_FIELD]: fieldConfig => {
      const requiresAuthDirective = (0, _utils.getDirective)(schema, fieldConfig, directiveName);

      if (requiresAuthDirective) {
        const {
          resolve = _graphql.defaultFieldResolver
        } = fieldConfig;

        fieldConfig.resolve = async function (parent, args, context, info) {
          // The custom code to extend the resolver for the annotated field. Surrounding code is boilerplate
          const accessToken = context?.req?.headers?.["access-token"]; // returns meId or throws if null or not valid

          context.meId = (0, _verifyAccessToken.default)(accessToken);
          return await resolve(parent, args, context, info); // end of custom code
        };

        return fieldConfig;
      }
    }
  });
} // Defining custom directive logic for @mustBeMe


function mustBeMeDirectiveTransformer(schema, directiveName = "mustBeMe") {
  return (0, _utils.mapSchema)(schema, {
    // Reminder: Square brackets are used for computed object property names. (Ie, computed key names)
    // MapperKind.OBJECT_FIELD correspondes to directives on FIELD_DEFINITIONs (eg @RequiresAuth)
    [_utils.MapperKind.OBJECT_FIELD]: fieldConfig => {
      const mustBeMeDirective = (0, _utils.getDirective)(schema, fieldConfig, directiveName);

      if (mustBeMeDirective) {
        const {
          resolve = _graphql.defaultFieldResolver
        } = fieldConfig;

        fieldConfig.resolve = async function (parent, args, context, info) {
          // The custom code to extend the resolver for the annotated field. Surrounding code is boilerplate
          if (context.meId !== parent.id) {
            throw new Error("***@mustBeMe directive - You don't have access to this information");
          }

          return await resolve(parent, args, context, info); // end of custom code
        };

        return fieldConfig;
      }
    }
  });
} // Adds the directive


schema = requiresAuthDirectiveTransformer(schema);
schema = mustBeMeDirectiveTransformer(schema);
var _default = schema;
exports.default = _default;