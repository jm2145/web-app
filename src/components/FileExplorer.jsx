import {
  DetailsView,
  FileManagerComponent,
  Inject,
  NavigationPane,
} from "@syncfusion/ej2-react-filemanager";
import * as React from "react";
import "./FileExplorer.css";
import { Toolbar } from "@syncfusion/ej2-navigations";

function FileExplorer() {
  let hostUrl = "https://ej2-aspcore-service.azurewebsites.net/";

  return (
    <div className="control-section">
      <FileManagerComponent
        id="overview_file"
        ajaxSettings={{
          url: hostUrl + "api/FileManager/FileOperations",
          getImageUrl: hostUrl + "api/FileManager/GetImage",
          uploadUrl: hostUrl + "api/FileManager/Upload",
          downloadUrl: hostUrl + "api/FileManager/Download",
        }}
        toolbarSettings={{
          items: [
            "NewFolder",
            "SortBy",
            "Cut",
            "Copy",
            "Paste",
            "Delete",
            "Refresh",
            "Download",
            "Rename",
            "Selection",
            "View",
            "Details",
          ],
        }}
        contextMenuSettings={{
          layout: [
            "SortBy",
            "View",
            "Refresh",
            "|",
            "Paste",
            "|",
            "NewFolder",
            "|",
            "Details",
            "|",
            "SelectAll",
          ],
        }}
        view={"Details"}
      >
        <Inject services={[NavigationPane, DetailsView, Toolbar]} />
      </FileManagerComponent>
    </div>
  );
}

export default FileExplorer;
