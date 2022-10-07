type WithMetadata<Entity> = Entity & {
  metadata: {
    testId: string;
    [key: string]: any;
  };
  [key: string]: any;
};

export default WithMetadata;
