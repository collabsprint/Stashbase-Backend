function FormatJoiErrors(errorDetails: any[]): Array<{ field: string; message: string }> {
    return errorDetails.map((err) => ({
      field: err.path[0],
      message: err.message.replace(/['"]+/g, '')
    }));
}

export default FormatJoiErrors;
