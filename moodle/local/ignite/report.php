<?php
require_once(__DIR__.'/../../config.php');
\local_ignite\reports::authorize();
$from=optional_param('from',gmdate('Y-m-d',time()-30*86400),PARAM_RAW_TRIMMED);
$to=optional_param('to',gmdate('Y-m-d'),PARAM_RAW_TRIMMED);
$row=\local_ignite\reports::request($from,$to);
$PAGE->set_context(context_system::instance()); $PAGE->set_url('/local/ignite/report.php',['from'=>$from,'to'=>$to]);
$PAGE->set_title(get_string('report_title','local_ignite')); $PAGE->set_heading(get_string('report_title','local_ignite'));
echo $OUTPUT->header();
echo html_writer::start_tag('form',['method'=>'get']);
foreach (['from'=>$from,'to'=>$to] as $key=>$value) {
    echo html_writer::tag('label',get_string('report_'.$key,'local_ignite'),['for'=>'report-'.$key]);
    echo html_writer::empty_tag('input',['id'=>'report-'.$key,'type'=>'date','name'=>$key,'value'=>$value,'required'=>true]);
}
echo html_writer::tag('button',get_string('report_filter','local_ignite'),['type'=>'submit','class'=>'btn btn-primary']);
echo html_writer::end_tag('form');
echo html_writer::tag('p',get_string('report_basis','local_ignite'));
if ($row->timeupdated<=0) { echo $OUTPUT->notification(get_string('report_pending','local_ignite'),'info'); }
else {
    $data=json_decode($row->payload,true);
    $rendertable=static function(html_table $table,string $label): string {
        // Native responsive wrappers have no tab stop. Make wide report tables scrollable by keyboard.
        $table->responsive=false;
        return html_writer::div(html_writer::table($table),'table-responsive',
            ['tabindex'=>0,'role'=>'region','aria-label'=>$label]);
    };
    echo html_writer::tag('p',get_string('report_asof','local_ignite',userdate($row->timeupdated)));
    if (!$data['completionenabled']) { echo $OUTPUT->notification(get_string('report_completionoff','local_ignite'),'info'); }
    $table=new html_table(); $table->head=[get_string('report_metric','local_ignite'),get_string('report_count','local_ignite'),get_string('report_denominator','local_ignite')];
    foreach (['denominator','onboarded','first','subsequent','badges','badgeowners'] as $key) {
        $table->data[]=[get_string('report_'.$key,'local_ignite'), (!$data['completionenabled'] && in_array($key,['first','subsequent'])) ? '—' : (int)$data[$key],
            $key==='subsequent' ? (int)$data['first'] : (int)$data['denominator']];
    }
    echo $rendertable($table,get_string('report_title','local_ignite'));
    $table=new html_table(); $table->head=[get_string('dash_myhearth','local_ignite'),get_string('report_count','local_ignite')];
    foreach ($data['memberships'] as $item) { $table->data[]=[s($item['name']),(int)$item['count']]; }
    echo $rendertable($table,get_string('dash_myhearth','local_ignite'));
    $table=new html_table(); $table->head=[get_string('hearthchallenges','local_ignite'),get_string('dash_myhearth','local_ignite'),get_string('report_count','local_ignite'),get_string('challenge_target','local_ignite')];
    foreach ($data['challenges'] as $item) { $table->data[]=[s($item['name']),s($item['hearth']),$item['count'],$item['target']]; }
    echo $rendertable($table,get_string('hearthchallenges','local_ignite'));
}
echo $OUTPUT->footer();
