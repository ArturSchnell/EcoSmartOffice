<script>
    import { Tooltip } from 'sveltestrap';

    let greenIcon;
</script>

<div class="tableLegend">
    <div class="tableFill green">
        <Tooltip target="{greenIcon}">Tische in diesem Raum sind nachhaltiger</Tooltip>
        <div class="tableText">
            Green <i bind:this="{greenIcon}" class="fa-brands fa-envira fa-flip-horizontal" style="color: #1ed24b;"></i>
        </div>
    </div>
    <div class="tableFill grey">
        <div class="tableText">Verfügbar</div>
    </div>
    <div class="tableFill orange">
        <div class="tableText">Belegt</div>
    </div>
</div>

<style>
    div.tableLegend {
        position: absolute;
        left: 5px;
        bottom: 5px;
        display: flex;
    }

    div.tableFill {
        position: relative;
        text-align: center;
        box-sizing: border-box;
        width: 80px;
        height: 10px;
        border: 1px solid #3c3c3b;
        margin: 5px;
        justify-content: end;
    }

    .green {
        background-color: #1ed24b;
    }

    .grey {
        background-color: #e7e7e7;
    }

    .orange {
        background-color: #ef7d00;
    }

    div.tableText {
        width: 100%;
        position: absolute;
        text-align: center;
        bottom: 10px;
    }

    i:hover {
        cursor: help;
    }
    @media only screen and (min-width: 600px) {
        div.tableLegend {
            position: absolute;
            left: 47px;
            bottom: 20px;
            display: flex;
        }

        div.tableFill {
            position: relative;
            text-align: center;
            box-sizing: border-box;
            width: 100px;
            height: 10px;
            border: 1px solid #3c3c3b;
            margin: 5px;
            justify-content: end;
        }
    }
</style>
