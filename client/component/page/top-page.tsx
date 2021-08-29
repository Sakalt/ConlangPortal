//

import * as react from "react";
import {
  ReactNode
} from "react";
import Component from "/client/component/component";
import DialectList from "/client/component/compound/dialect-list";
import {
  style
} from "/client/component/decorator";
import Page from "/client/component/page/page";


@style(require("./top-page.scss"))
export default class TopPage extends Component<Props, State> {

  public render(): ReactNode {
    let node = (
      <Page>
        <div styleName="list">
          <DialectList approved={true}/>
        </div>
        <div styleName="list">
          <DialectList approved={false}/>
        </div>
      </Page>
    );
    return node;
  }

}


type Props = {
};
type State = {
};